'use client'
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import BrutalistInput from "./brutalist-input";
import ClockTimer from "./ClockTimer";

export default function Home() {
  const [tasks, setTasks] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [timerMode, setTimerMode] = useState<'focus' | 'short' | 'long'>('focus');
  const [focusMinutes, setFocusMinutes] = useState(25);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setTasks([...tasks, inputValue.trim()]);
      setInputValue('');
    }
  };

  const handleDelete = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  useEffect(() => {
    // Initialize the brutalist input component
    const brutalistInput = new BrutalistInput("form.contact");
    
    // Clean up on unmount
    return () => {
      // Any cleanup if needed
    };
  }, []);

  // Timer values
  const timerMinutes = timerMode === 'focus' ? focusMinutes : timerMode === 'short' ? 5 : 10;
  const timerEditable = timerMode === 'focus';

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-200 to-yellow-300 relative overflow-hidden font-sans">
      {/* Blur Animation */}
      <div className="blur-animation" />

      {/* Navigation */}
      <nav className="flex justify-end p-4 mr-8 mt-4 relative z-10">
        <div className="text-gray-600 font-cabin">
          <Link href="/" className="nav-link active">home</Link>
          <span className="mx-2">|</span>
          <Link href="/dashboard" className="nav-link">dashboard</Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 pt-20 relative z-10">
        <div className="flex items-center">
          <div className="w-full max-w-2xl">
            <h1 className="text-2xl md:text-3xl font-extrabold mb-8 text-black mt-0 tracking-wide lowercase cabin-font" style={{fontWeight:900, textShadow:'0 2px 8px #ffb84d'}}> 
              let’s make today count. whats the plan?
            </h1>
            <div className="relative px-4">
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
                    style={{ fontStyle: 'italic', height: '60px' }}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                  <button type="submit" className="contact__submit">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </button>
                </div>
              </form>

              {/* Tasks List */}
              <div className="tasks-list mt-8 max-h-[28rem] overflow-y-auto pr-2 rounded bg-white/80 shadow-inner">
                {tasks.map((task, index) => (
                  <div key={index} className="task-item">
                    <input type="checkbox" id={`task-${index}`} className="task-checkbox" />
                    <label htmlFor={`task-${index}`} className="task-label">
                      {task}
                    </label>
                    <button 
                      onClick={() => handleDelete(index)} 
                      className="task-delete"
                      aria-label="Delete task"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                        <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {/* Set Timer Section - moved below tasks, now a clock UI */}
              <div className="mt-10 flex flex-row items-center justify-center gap-30">
                {/* Timer shifted left */}
                <div className="flex-shrink-0 ml-2">
                  <ClockTimer
                    initialMinutes={timerMinutes}
                    editable={timerEditable}
                    onMinutesChange={setFocusMinutes}
                    key={timerMode}
                  />
                </div>
                {/* Controls to the right of timer */}
                <div className="flex flex-col gap-6 items-start mt-8">
                  <label className="text-lg font-bold uppercase tracking-wider text-black mb-2">Set Focus Session</label>
                  {/* Vertical list of timer mode options */}
                  <ul className="flex flex-col gap-3 mb-2 w-full">
                    <li>
                      <button
                        type="button"
                        onClick={() => setTimerMode('focus')}
                        className={`w-full px-6 py-2 rounded-full font-bold text-lg transition-all border-2 text-center cursor-pointer ${timerMode === 'focus' ? 'bg-white text-orange-500 border-white shadow' : 'bg-transparent border-white text-orange-400 hover:bg-white hover:text-orange-500'}`}
                      >
                        Focus Session
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => setTimerMode('short')}
                        className={`w-full px-6 py-2 rounded-full font-bold text-lg transition-all border-2 text-center cursor-pointer ${timerMode === 'short' ? 'bg-white text-orange-500 border-white shadow' : 'bg-transparent border-white text-orange-400 hover:bg-white hover:text-orange-500'}`}
                      >
                        Short Break
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => setTimerMode('long')}
                        className={`w-full px-6 py-2 rounded-full font-bold text-lg transition-all border-2 text-center cursor-pointer ${timerMode === 'long' ? 'bg-white text-orange-500 border-white shadow' : 'bg-transparent border-white text-orange-400 hover:bg-white hover:text-orange-500'}`}
                      >
                        Long Break
                      </button>
                    </li>
                  </ul>
                  <button className="px-8 py-3 bg-yellow-500 hover:bg-yellow-600 text-white text-lg font-bold rounded shadow focus:outline-none transition-all w-full max-w-xs mt-2 cursor-pointer" type="button">
                    Start Focusing
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Mascot - Positioned absolutely relative to viewport */}
      <div className="fixed right-0 bottom-10 right-25 z-0 overflow-visible">
        <Image
          src="/mascot-image.png"
          alt="Cute mascot"
          width={600}
          height={600}
          className="translate-x-1/6 -translate-y-1/4 -scale-x-100"
          priority
        />
      </div>
    </div>
  );
}
