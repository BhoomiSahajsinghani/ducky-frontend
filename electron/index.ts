// Native
import { join } from 'node:path';

// Packages
import { BrowserWindow, app, ipcMain, type IpcMainEvent, nativeTheme, desktopCapturer, screen } from 'electron';
import isDev from 'electron-is-dev';
import ollama from 'ollama'
import crypto from 'crypto';

let notificationWindow: BrowserWindow | null = null;

function showNotification(show: boolean, nudge: string) {
  console.log('showNotification:', { show, nudge });
  if (show && !notificationWindow) {
    const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
    
    notificationWindow = new BrowserWindow({
      width: 450,
      height: 200,
      x: screenWidth,
      y: screenHeight,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      skipTaskbar: true,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        webSecurity: false // Allow loading local images
      }
    });

    const filePath = join(__dirname, '..', 'src', 'notification.html');
    console.log('Loading notification from:', filePath);
    notificationWindow.loadFile(filePath, {
      query: {
        nudge
      }
    });

    notificationWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
      console.error('Failed to load notification:', errorCode, errorDescription);
    });

    // notificationWindow.webContents.openDevTools({ mode: 'detach' });

    notificationWindow.on('closed', () => {
      notificationWindow = null;
    });
  } else if (!show && notificationWindow) {
    notificationWindow.close();
    notificationWindow = null;
  }
}

interface WindowInfo {
  id: string;
  name: string;
  title: string;
  image: string;
  timestamp: string;
  isFocused?: boolean;
  idleDetected?: boolean;
  nudge?: string;
  imageHash?: string;
}

const height = 800;
const width = 1200;

// Keep track of last capture time and app
let lastCaptureTime = 0;
let lastAppName = '';
const DEBOUNCE_TIME = 5000; // 10 seconds in milliseconds
const IDLE_TIME_THRESHOLD = 60000; // 60 seconds for idle detection
let isTracking = false;

// Image hash tracking for idle detection
let lastImageHash = '';
let lastHashTime = 0;
let consecutiveSameHashes = 0;

let currentPrompt = '';
let toReturn: WindowInfo | null = null;

// Function to get focused window information
async function getFocusedWindowInfo() {
  if (!isTracking) return null;
  const now = Date.now();
  
  try {
    // Get all window sources
    const sources = await desktopCapturer.getSources({
      types: ['window'],
      thumbnailSize: { width: 1280, height: 720 }
    });
    
    // Get the focused window
    const focusedWindow = BrowserWindow.getFocusedWindow();
    const focusedTitle = focusedWindow?.getTitle() || '';
    
    // Find the matching source to get the app name
    const matchingSource = sources.find(source => 
      source.name.includes(focusedTitle) || focusedTitle.includes(source.name)
    );
    
    if (!matchingSource) {
      return toReturn;
    }

    // Check if app changed or enough time has passed
    const appChanged = lastAppName !== matchingSource.name;
    const timeElapsed = now - lastCaptureTime >= DEBOUNCE_TIME;
    
    if (!timeElapsed && !appChanged) {
      return toReturn;
    }

    // Update tracking variables
    lastCaptureTime = now;
    lastAppName = matchingSource.name;
    
    // Create image hash for idle detection
    const imageBuffer = matchingSource.thumbnail.toJPEG(50); // Lower quality for hash
    const imageHash = crypto.createHash('md5').update(imageBuffer).digest('hex');
    
    // Check for idle by comparing image hashes
    let idleDetected = false;
    let idleNudge = '';
    
    if (imageHash === lastImageHash) {
      consecutiveSameHashes++;
      const idleTime = now - lastHashTime;
      
      // If the screen has been the same for a while (idle threshold)
      if (idleTime > IDLE_TIME_THRESHOLD && consecutiveSameHashes >= 3) {
        idleDetected = true;
        idleNudge = getIdleNudge();
      }
    } else {
      // Reset idle detection when screen changes
      lastImageHash = imageHash;
      lastHashTime = now;
      consecutiveSameHashes = 0;
    }
    
    // Create new window info
    toReturn = {
      id: matchingSource.id,
      name: matchingSource.name,
      title: focusedTitle,
      image: matchingSource.thumbnail.toDataURL(),
      timestamp: new Date().toISOString(),
      imageHash,
      idleDetected
    };

    // If we already detected idle, skip the LLM call
    if (idleDetected) {
      showNotification(true, idleNudge);
      return {
        ...toReturn,
        isFocused: false,
        nudge: idleNudge
      };
    }

    const uintArray = new Uint8Array(matchingSource.thumbnail.toJPEG(1000));
    const prompt = `You are a productivity assistant. Decide if the user's current activity aligns with their intended task.

    Intended task (user wants to..):
    ${currentPrompt}
    
    Current activity:
    Title: ${focusedTitle}
    Source: ${matchingSource.name}
    
    Guidelines:
    - Here, being productivity just implies doing what the user wants to do. Even though it may not look like it, the user is still doing what they want to do.
    - Say "Yes" if the activity clearly supports or contributes to the task.
    - Say "No" if it distracts or is unrelated.
    - Supportive tools, quick context switches, or relevant collaboration are okay.
    - Use common sense and err on the side of "No" if unclear.
    - Err towards "yes" even if the activity is neutral or ambiguous.
    - If distracted, add a small, cute and playful nudge. '
    
    Respond in the following format, ALWAYS: 
    <isFocused>
    [Yes or No]
    </isFocused>
    <nudge>
    [Small, cute and playful nudge if distracted, otherwise empty. Keep it short and sweet.]
    </nudge>
    `

    console.log(prompt)
    
    const response = await ollama.chat({ model: 'llava', messages: [{
      role: 'user',
      content: prompt,
      images: [uintArray]
    }]})

    const answer = response.message.content

    console.log(answer)

    const isFocused = answer.split("<isFocused>")[1].split("</isFocused>")[0].trim().toLowerCase().includes("yes");
    const nudge = answer.split("<nudge>")[1].split("</nudge>")[0].trim();
    console.log('isFocused:', isFocused)
    console.log('answer:', answer)
    showNotification(!isFocused, nudge);

    return {
      ...toReturn,
      isFocused,
      nudge
    }
  } catch (error) {
    console.error('Error getting window info:', error);
    return null;
  }
}

// Function to get a random idle nudge
function getIdleNudge() {
  const idleNudges = [
    "It seems like you haven't moved in a while. Need a stretch break?",
    "Are you still there? Your screen hasn't changed in a bit.",
    "Time for a quick break? You've been looking at the same screen for a while.",
    "Hmm, no activity detected. Maybe time to refresh your focus?",
    "Taking a mental break? Your screen has been idle for some time.",
    "Still with me? I noticed no changes on your screen for a while."
  ];
  
  return idleNudges[Math.floor(Math.random() * idleNudges.length)];
}

function createWindow() {
  // Create the browser window with native frame
  const window = new BrowserWindow({
    width,
    height,
    frame: true,
    titleBarStyle: 'hiddenInset',
    show: true,
    resizable: true,
    fullscreenable: true,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: true
    }
  });

  const port = process.env.PORT || 3000;
  const url = isDev ? `http://localhost:${port}` : join(__dirname, '../dist-vite/index.html');

  // and load the index.html of the app.
  if (isDev) {
    window?.loadURL(url);
  } else {
    window?.loadFile(url);
  }
  // Open the DevTools.
  // window.webContents.openDevTools();

  nativeTheme.themeSource = 'dark';
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// Handle focused window information requests
ipcMain.handle('get-focused-window', async () => {
  return await getFocusedWindowInfo();
});

// Handle prompt updates
ipcMain.handle('set-prompt', (_event, prompt: string) => {
  currentPrompt = prompt;
  return true;
});

// Handle start tracking focused window
ipcMain.on('start-tracking-focused', (event: IpcMainEvent) => {
  isTracking = true;
  const trackingInterval = setInterval(async () => {
    const focusedWindow = await getFocusedWindowInfo();
    if (focusedWindow) { // Only send update if we have new window info
      event.sender.send('focused-window-update', focusedWindow);
    }
  }, DEBOUNCE_TIME);
  // Clean up intervals when stop-tracking is received
  ipcMain.once('stop-tracking-focused', () => {
    clearInterval(trackingInterval);
    isTracking = false;
  });
});

// listen the channel `message` and resend the received message to the renderer process
ipcMain.on('message', (event: IpcMainEvent, message: unknown) => {
  console.log(message);
  setTimeout(() => event.sender.send('message', 'common.hiElectron'), 500);
});