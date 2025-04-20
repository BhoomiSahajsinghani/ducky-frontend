import * as React from 'react';
import BrutalistInput from './brutalist-input';
import ClockTimer from './ClockTimer';
import mascotImage from './assets/mascot-image.png';
import Dashboard from './Dashboard';

const { useEffect, useState, useCallback } = React;

interface DistractionNotificationProps {
  show: boolean;
}

const DistractionNotification: React.FC<DistractionNotificationProps> = ({ show }) => {
  if (!show) return null;

  return (
    <div
      className="fixed inset-0 bg-red-600/90 flex flex-col items-center justify-center text-white animate-[pulse_1.5s_ease-in-out_infinite] backdrop-blur-sm"
      style={{ zIndex: 9999 }}
    >
      <div className="text-6xl font-bold mb-4 animate-[bounce_1s_ease-in-out_infinite]">⚠️</div>
      <div className="text-4xl font-bold tracking-tight mb-2 animate-[shake_0.5s_ease-in-out_infinite]">
        DISTRACTED!
      </div>
      <div className="text-xl opacity-90">
        Return to your focused window
      </div>
    </div>
  );
};

interface WindowInfo {
  id: string;
  name: string;
  title: string;
  image: string;
  timestamp: string;
  isFocused?: boolean;
  idleDetected?: boolean;
  nudge?: string;
}

// Mascot positions to choose from
const MASCOT_POSITIONS = [
  { position: 'bottom-left', class: 'bottom-0 left-10' },
  { position: 'bottom-right', class: 'bottom-0 right-10' },
  { position: 'top-left', class: 'top-20 left-10' },
  { position: 'top-right', class: 'top-20 right-10' }
];

function App() {
  const [focusedWindow, setFocusedWindow] = useState<WindowInfo | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [showDebug, setShowDebug] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'dashboard'>('home');
  const [mascotPosition, setMascotPosition] = useState(MASCOT_POSITIONS[0]);
  const [showIdleAlert, setShowIdleAlert] = useState(false);
  
  interface Task {
    text: string;
    completed: boolean;
  }
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [timerMode, setTimerMode] = useState<'focus' | 'short' | 'long'>('focus');
  const [focusMinutes, setFocusMinutes] = useState(25);

  // Function to change mascot position
  const changeMascotPosition = useCallback(() => {
    const currentIndex = MASCOT_POSITIONS.findIndex(p => p.position === mascotPosition.position);
    const nextIndex = (currentIndex + 1) % MASCOT_POSITIONS.length;
    setMascotPosition(MASCOT_POSITIONS[nextIndex]);
  }, [mascotPosition]);

  // Change mascot position occasionally
  useEffect(() => {
    if (!isTracking) return;

    const interval = setInterval(() => {
      // 20% chance to change position when tracking
      if (Math.random() < 0.2) {
        changeMascotPosition();
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [isTracking, changeMascotPosition]);

  useEffect(() => {
    console.log({ focusedWindow });
    
    // Handle idle detection
    if (focusedWindow?.idleDetected) {
      setShowIdleAlert(true);
      // Hide idle alert after 5 seconds
      const timeout = setTimeout(() => setShowIdleAlert(false), 5000);
      return () => clearTimeout(timeout);
    }
  }, [focusedWindow]);

  const updatePrompt = () => {
    const activeTasksText = tasks
      .filter(task => !task.completed)
      .map(task => task.text)
      .join('\n');
    setPrompt(activeTasksText);
  };

  useEffect(() => {
    window.Main?.setPrompt(prompt);
  }, [prompt]);

  useEffect(() => {
    updatePrompt();
  }, [tasks]);

  const toggleTracking = () => {
    if (isTracking) {
      window.Main?.stopTrackingFocused();
      setIsTracking(false);
    } else {
      const activeTasksText = tasks
        .filter(task => !task.completed)
        .map(task => task.text)
        .join('\n');
      window.Main?.setPrompt(activeTasksText);
      window.Main?.startTrackingFocused();
      setIsTracking(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setTasks([...tasks, { text: inputValue.trim(), completed: false }]);
      setInputValue('');
    }
  };

  const handleToggleTask = (index: number) => {
    setTasks(tasks.map((task, i) => 
      i === index ? { ...task, completed: !task.completed } : task
    ));
    updatePrompt();
  };

  const handleDelete = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
    updatePrompt();
  };

  useEffect(() => {
    // Initialize the brutalist input component
    const brutalistInput = new BrutalistInput('form.contact');

    // Clean up on unmount
    return () => {
      // Any cleanup if needed
    };
  }, []);

  // Timer values
  const timerMinutes = timerMode === 'focus' ? focusMinutes : timerMode === 'short' ? 5 : 10;
  const timerEditable = timerMode === 'focus';

  useEffect(() => {
    window.Main?.removeLoading();

    if (window.Main) {
      window.Main.getFocusedWindow().then((info: WindowInfo | null) => {
        setFocusedWindow(info);
      });

      window.Main.onFocusedWindowUpdate((window: WindowInfo | null) => {
        setFocusedWindow(window);
      });
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen overflow-hidden bg-[#FFFDCD]">
      {/* Background elements */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        {/* Large orb gradients */}
        <div className="absolute top-1/3 -right-96 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-[#ffb84d]/40 to-[#ff8c00]/30 blur-3xl animate-[float_20s_ease-in-out_infinite_alternate]"></div>
        <div className="absolute -top-96 -left-96 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-[#ffd700]/30 to-[#ff8c00]/20 blur-3xl animate-[float_25s_ease-in-out_infinite_alternate-reverse]"></div>
        
        {/* Subtle pattern */}
        <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{ 
          backgroundImage: 'radial-gradient(#ff8c00 1px, transparent 1px)', 
          backgroundSize: '30px 30px',
          backgroundPosition: '0 0'
        }}></div>
        
        {/* Animated lines */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ff8c00]/40 to-transparent animate-[shimmer_8s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ff8c00]/40 to-transparent animate-[shimmer_8s_ease-in-out_infinite_1s]"></div>
      </div>

      <DistractionNotification show={!!focusedWindow?.isFocused} />
      
      {/* Idle alert */}
      {showIdleAlert && (
        <div className="fixed inset-0 bg-yellow-500/80 flex flex-col items-center justify-center text-white backdrop-blur-sm animate-[fadeIn_0.3s_ease-in-out]" style={{ zIndex: 9998 }}>
          <div className="bg-white/20 backdrop-blur-md p-6 rounded-xl shadow-xl max-w-md text-center">
            <div className="text-4xl mb-4">⏰</div>
            <div className="text-2xl font-bold mb-2">Time for a change?</div>
            <div className="text-xl">
              {focusedWindow?.nudge || "Your screen hasn't changed in a while. Maybe take a break?"}
            </div>
          </div>
        </div>
      )}
      
      {/* App header with navigation */}
      <div className="h-16 w-full flex items-center px-4 z-20 relative"
           style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
        <div className="mr-auto ml-2 text-[#8B4513] font-semibold tracking-wide text-xl mt-8">
          <span className="font-cabin">Focus<span className="text-[#ff8c00]">Ducky</span></span>
        </div>
        
        <nav className="mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-full px-2 py-1.5 shadow-lg flex items-center space-x-1 border border-[#ff8c00]/20 transition-all duration-300 hover:bg-white/90 hover:shadow-xl">
            <button
              onClick={() => setCurrentView('home')}
              className={`nav-link px-6 py-1.5 rounded-full transition-all duration-300 ${
                currentView === 'home' 
                  ? 'bg-[#ff8c00] text-white font-bold shadow-md transform scale-105' 
                  : 'text-[#8B4513] hover:bg-[#ff8c00]/10'
              }`}
              type="button"
              style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            >
              home
            </button>
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`nav-link px-6 py-1.5 rounded-full transition-all duration-300 ${
                currentView === 'dashboard' 
                  ? 'bg-[#ff8c00] text-white font-bold shadow-md transform scale-105' 
                  : 'text-[#8B4513] hover:bg-[#ff8c00]/10'
              }`}
              type="button"
              style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            >
              dashboard
            </button>
          </div>
        </nav>
        
        <button
          type="button"
          className="ml-auto text-[#8B4513] hover:text-[#ff8c00] transition-colors px-2 py-1 flex items-center gap-1"
          onClick={() => setShowDebug(!showDebug)}
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
          Debug
        </button>
      </div>

      {!showDebug ? (
        <div className="flex-1 relative font-sans overflow-hidden">
          {/* Main content */}
          {currentView === 'home' ? (
            <div className="container mx-auto px-6 pt-8 pb-24 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left column - Tasks */}
                <div className="w-full mt-4">
                  <h1
                    className="text-3xl md:text-4xl font-extrabold mb-8 text-black tracking-wide lowercase cabin-font animate-[fadeIn_0.5s_ease-in]"
                    style={{ fontWeight: 900, textShadow: '0 2px 8px #ffb84d' }}
                  >
                    let's make today count.
                    <div className="text-[#8B4513] opacity-90 mt-1">whats the plan?</div>
                  </h1>

                  <div className="relative max-w-2xl animate-[slideInLeft_0.6s_ease-out]">
                    <form className="contact" action="" onSubmit={handleSubmit}>
                      <div className="contact__field">
                        <input
                          className="contact__input"
                          id="task"
                          name="task"
                          type="text"
                          placeholder="Type here..."
                          autoComplete="off"
                          spellCheck="false"
                          aria-required="true"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                        />
                        <button type="submit" className="contact__submit">
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="square"
                          >
                            <title>Submit</title>
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                          </svg>
                        </button>
                      </div>
                    </form>

                    {/* Tasks List */}
                    <div className="tasks-list mt-8 max-h-[calc(100vh-320px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#ff8c00] scrollbar-track-transparent">
                      {tasks.length > 0 ? (
                        tasks.map((task, index) => (
                          <div
                            key={`task-${index}`}
                            className={`task-item ${task.completed ? 'opacity-70' : ''} animate-[slideIn_0.3s_ease-out]`}
                            style={{ animationDelay: `${index * 0.05}s` }}
                          >
                            <input 
                              type="checkbox" 
                              id={`task-${index}`} 
                              className="task-checkbox"
                              checked={task.completed}
                              onChange={() => handleToggleTask(index)}
                            />
                            <label htmlFor={`task-${index}`} className="task-label">
                              {task.text}
                            </label>
                            <button
                              onClick={() => handleDelete(index)}
                              className="task-delete"
                              aria-label="Delete task"
                              type="button"
                            >
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="square"
                              >
                                <title>Delete task</title>
                                <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                              </svg>
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="mt-8 text-center p-8 border-2 border-dashed border-[#ff8c00]/40 rounded-lg bg-white/40 animate-[pulse_3s_ease-in-out_infinite]">
                          <p className="text-[#8B4513] italic">No tasks yet. Add one to get started!</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right column - Timer */}
                <div className="w-full flex flex-col items-center justify-center mt-6 lg:mt-0 animate-[slideInRight_0.6s_ease-out]">
                  <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-[#ff8c00]/20 flex flex-col items-center max-w-md transition-all duration-300 hover:shadow-xl hover:bg-white/40">
                    <div className="mb-6">
                      <div className="flex space-x-4 mb-6">
                        {(['focus', 'short', 'long'] as const).map((mode) => (
                          <button
                            key={mode}
                            onClick={() => setTimerMode(mode)}
                            className={`px-4 py-2 rounded-full transition-all duration-300 ${
                              timerMode === mode
                                ? 'bg-[#ff8c00] text-white font-semibold shadow-md transform scale-105'
                                : 'bg-white/70 text-[#8B4513] hover:bg-white'
                            }`}
                            type="button"
                            disabled={isTracking}
                          >
                            {mode === 'focus' ? 'Focus' : mode === 'short' ? 'Short Break' : 'Long Break'}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <ClockTimer
                      initialMinutes={timerMinutes}
                      editable={timerEditable}
                      onMinutesChange={setFocusMinutes}
                      isRunning={isTracking}
                      key={timerMode}
                    />
                    
                    <div className="mt-8 w-full">
                      <button
                        onClick={toggleTracking}
                        className={`group w-full py-4 px-6 text-white text-lg font-medium rounded-xl shadow-lg transform transition-all duration-300 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50 tracking-wide flex items-center justify-center gap-2 ${
                          isTracking 
                            ? 'bg-[#e67e00] hover:bg-[#d07000]' 
                            : 'bg-black hover:bg-gray-900'
                        }`}
                        type="button"
                        disabled={tasks.filter(task => !task.completed).length === 0}
                      >
                        <span>{isTracking ? 'pause focus' : 'start focus'}</span>
                        {!isTracking && (
                          <svg className="w-5 h-5 transition-transform duration-300 ease-out group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <title>Start arrow</title>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </button>
                      
                      {tasks.filter(task => !task.completed).length === 0 && (
                        <p className="text-center text-[#8B4513] text-sm mt-2 animate-[fadeIn_0.5s_ease-in]">Add a task to enable focus mode</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Dashboard />
          )}
          
          {/* Mascot image - now appears in different positions */}
          {!showDebug && currentView === "home" && (
            <div className={`absolute z-0 overflow-visible transition-all duration-1000 ease-in-out ${mascotPosition.class}`}>
              <img 
                src={mascotImage} 
                alt="Cute mascot" 
                width={400} 
                height={400} 
                className="animate-[mascotBounce_6s_ease-in-out_infinite_alternate] transition-transform duration-700"
                onClick={changeMascotPosition}
                style={{ cursor: 'pointer' }}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 p-6 overflow-auto">
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Window Tracker Debug</h1>
              <button
                className={`py-2 px-4 rounded focus:outline-none shadow z-[99] ${
                  isTracking ? 'bg-red-400 hover:bg-red-500' : 'bg-green-400 hover:bg-green-500'
                }`}
                onClick={toggleTracking}
                type="button"
              >
                {isTracking ? 'Stop Tracking' : 'Start Tracking'}
              </button>
            </div>

            {focusedWindow ? (
              <div className="bg-gray-800 rounded-lg p-4 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-white">{focusedWindow.title || focusedWindow.name}</h3>
                  <p className="text-sm text-gray-400">{focusedWindow.name}</p>
                  <p className="text-xs text-gray-500">{new Date(focusedWindow.timestamp).toLocaleString()}</p>
                  {focusedWindow.idleDetected && (
                    <div className="mt-2 bg-yellow-500/20 text-yellow-300 p-2 rounded">
                      Idle detected! Screen hasn't changed in a while.
                    </div>
                  )}
                </div>
                <div className="bg-gray-900 rounded overflow-hidden">
                  <img src={focusedWindow.image} alt={focusedWindow.title} className="w-full h-auto" />
                </div>
              </div>
            ) : (
              <div className="text-gray-400">No window focused</div>
            )}
          </div>
        </div>
      )}

      {/* Add CSS keyframes for animations */}
      <style jsx="true">{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes float {
          0% { transform: translateY(0) rotate(0); }
          50% { transform: translateY(-30px) rotate(5deg); }
          100% { transform: translateY(0) rotate(0); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideInLeft {
          from { transform: translateX(-20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideInRight {
          from { transform: translateX(20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideIn {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes mascotBounce {
          0% { transform: translateY(0); }
          60% { transform: translateY(0); }
          65% { transform: translateY(-20px); }
          70% { transform: translateY(0); }
          75% { transform: translateY(-10px); }
          80% { transform: translateY(0); }
          100% { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default App;