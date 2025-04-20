import * as React from "react";
const { useState, useRef, useEffect } = React;

interface ClockTimerProps {
  initialMinutes?: number;
  editable?: boolean;
  onMinutesChange?: (minutes: number) => void;
  isRunning?: boolean;
}

const MAX_MINUTES = 180;
const MIN_MINUTES = 1;
const WIDTH = 240;
const HEIGHT = 240;
const RADIUS = 110;

function pad(num: number): string {
  return num < 10 ? `0${num}` : `${num}`;
}

export default function ClockTimer({ initialMinutes = 25, editable = true, onMinutesChange, isRunning = false }: ClockTimerProps) {
  const [minutes, setMinutes] = useState(initialMinutes);
  const [seconds, setSeconds] = useState(0);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(`${pad(initialMinutes)}:${pad(0)}`);
  const inputRef = useRef<HTMLInputElement>(null);

  const totalSeconds = minutes * 60 + seconds;
  const initialTotalSeconds = initialMinutes * 60;

  // For wave animation
  const [wavePhase, setWavePhase] = useState(0);
  const requestRef = useRef<number>();

  useEffect(() => {
    if (!isRunning) return;
    if (totalSeconds <= 0) return;
    const interval = setInterval(() => {
      setSeconds((s) => {
        if (s > 0) return s - 1;
        if (minutes > 0) {
          setMinutes((m) => m - 1);
          return 59;
        }
        return 0;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, minutes, seconds, totalSeconds]);

  // Animate wave phase for horizontal movement
  useEffect(() => {
    if (!isRunning) return;
    const animate = () => {
      setWavePhase((p) => p + 0.07);
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [isRunning]);

  // Focus input when editing
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  // Sync minutes if initialMinutes changes (e.g., on mode switch)
  useEffect(() => {
    setMinutes(initialMinutes);
    setSeconds(0);
  }, [initialMinutes]);

  // Calculate fill percent
  const fillPercent = totalSeconds / initialTotalSeconds;
  const waveHeight = HEIGHT * (1 - fillPercent);
  const waveAmplitude = 12; // Increased for more visible waves
  const waveFrequency = 2;

  // Generate SVG path for the wave
  const getWavePath = () => {
    let d = `M 0 ${waveHeight}`;
    for (let x = 0; x <= WIDTH; x += 4) {
      const y =
        waveHeight +
        Math.sin((x / WIDTH) * Math.PI * waveFrequency + wavePhase) * waveAmplitude;
      d += ` L ${x} ${y}`;
    }
    d += ` L ${WIDTH} ${HEIGHT}`;
    d += ` L 0 ${HEIGHT} Z`;
    return d;
  };

  const handleIncrement = () => {
    if (isRunning || !editable) return;
    if (editing) {
      const currentMin = Number.parseInt(editValue.split(':')[0], 10) || 0;
      const currentSec = Number.parseInt(editValue.split(':')[1], 10) || 0;
      const newMin = currentMin < MAX_MINUTES ? currentMin + 1 : currentMin;
      setEditValue(`${pad(newMin)}:${pad(currentSec)}`);
    } else {
      setMinutes((m) => {
        const newM = m < MAX_MINUTES ? m + 1 : m;
        if (onMinutesChange) onMinutesChange(newM);
        return newM;
      });
      setSeconds(0);
    }
  };

  const handleDecrement = () => {
    if (isRunning || !editable) return;
    if (editing) {
      const currentMin = Number.parseInt(editValue.split(':')[0], 10) || 0;
      const currentSec = Number.parseInt(editValue.split(':')[1], 10) || 0;
      const newMin = currentMin > MIN_MINUTES ? currentMin - 1 : currentMin;
      setEditValue(`${pad(newMin)}:${pad(currentSec)}`);
    } else {
      setMinutes((m) => {
        const newM = m > MIN_MINUTES ? m - 1 : m;
        if (onMinutesChange) onMinutesChange(newM);
        return newM;
      });
      setSeconds(0);
    }
  };

  const handleReset = () => {
    setMinutes(initialMinutes);
    setSeconds(0);
    if (onMinutesChange && editable) onMinutesChange(initialMinutes);
  };

  // Handle click to edit
  const handleCircleClick = () => {
    if (isRunning || !editable) return;
    setEditValue(`${pad(minutes)}:${pad(seconds)}`);
    setEditing(true);
  };

  // Handle input change and blur/enter
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  };

  const handleEditBlurOrEnter = () => {
    // Accept mm:ss or m:ss
    const match = editValue.match(/^\s*(\d{1,3})\s*:?\s*(\d{0,2})\s*$/);
    if (match) {
      let min = Math.max(MIN_MINUTES, Math.min(MAX_MINUTES, parseInt(match[1], 10)));
      let sec = match[2] ? Math.max(0, Math.min(59, parseInt(match[2], 10))) : 0;
      setMinutes(min);
      setSeconds(sec);
      if (onMinutesChange) onMinutesChange(min);
    }
    setEditing(false);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleEditBlurOrEnter();
    } else if (e.key === "Escape") {
      setEditing(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-60 h-60 flex items-center justify-center">
        {/* Plus/Minus buttons */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDecrement();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              e.stopPropagation();
              handleDecrement();
            }
          }}
          className={`absolute -left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full text-2xl font-bold flex items-center justify-center shadow-lg z-10 transition-all ${
            isRunning || !editable 
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-white hover:bg-gray-100 text-[#8B4513] hover:scale-105 active:scale-95 border-2 border-[#ff8c00]'
          }`}
          aria-label="Decrease minutes"
          disabled={isRunning || !editable}
          type="button"
        >
          −
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleIncrement();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              e.stopPropagation();
              handleIncrement();
            }
          }}
          className={`absolute -right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full text-2xl font-bold flex items-center justify-center shadow-lg z-10 transition-all ${
            isRunning || !editable 
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-white hover:bg-gray-100 text-[#8B4513] hover:scale-105 active:scale-95 border-2 border-[#ff8c00]'
          }`}
          aria-label="Increase minutes"
          disabled={isRunning || !editable}
          type="button"
        >
          +
        </button>
        
        <button
          type="button"
          className={`relative w-full h-full cursor-pointer group transition-transform ${
            !isRunning && editable ? 'hover:scale-[1.02]' : ''
          }`}
          onClick={handleCircleClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleCircleClick();
            }
          }}
          disabled={!editable || isRunning}>
          <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="absolute top-0 left-0">
            <defs>
              <filter id="shadow">
                <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#2196f3" floodOpacity="0.3" />
              </filter>
              <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2196f3" />
                <stop offset="50%" stopColor="#64b5f6" />
                <stop offset="100%" stopColor="#2196f3" />
              </linearGradient>
            </defs>
            
            {/* Outer glow */}
            <circle
              cx={WIDTH / 2}
              cy={HEIGHT / 2}
              r={RADIUS + 4}
              fill="none"
              stroke="#64b5f6"
              strokeWidth="1"
              strokeOpacity="0.5"
              filter="url(#shadow)"
            />
            
            {/* Main circle */}
            <circle
              cx={WIDTH / 2}
              cy={HEIGHT / 2}
              r={RADIUS}
              stroke={isRunning ? "#1e88e5" : "#000"}
              strokeWidth="4"
              fill="white"
              fillOpacity="0.2"
              className="transition-all duration-500"
            />
            
            <clipPath id="clipCircle">
              <circle cx={WIDTH / 2} cy={HEIGHT / 2} r={RADIUS - 2} />
            </clipPath>
            
            {/* Wave with blue color now */}
            <g clipPath="url(#clipCircle)">
              <path 
                d={getWavePath()} 
                fill="url(#waveGradient)" 
                opacity={isRunning ? "0.9" : "0.7"}
                className="transition-opacity duration-300"
              />
              
              {/* Wave pattern on top of the main wave */}
              <path 
                d={getWavePath()} 
                fill="none"
                stroke="#ffffff"
                strokeWidth="1"
                strokeOpacity="0.3"
                strokeDasharray="3,4"
              />
              
              {/* Add shimmer effect on top of the wave */}
              {isRunning && (
                <rect 
                  x="0" 
                  y={waveHeight - 5} 
                  width={WIDTH} 
                  height="5" 
                  fill="white" 
                  opacity="0.2"
                  className="animate-[shimmer_3s_ease-in-out_infinite]"
                />
              )}
            </g>
            
            {/* Small decorative inner circle */}
            <circle
              cx={WIDTH / 2}
              cy={HEIGHT / 2}
              r={RADIUS - 15}
              stroke="#64b5f6"
              strokeWidth="1"
              strokeDasharray="3,3"
              fill="none"
              opacity="0.7"
            />
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-sm text-[#8B4513] mb-2 select-none font-medium tracking-wide">
              {isRunning ? "FOCUSING" : "SPRINT TIME"}
            </span>
            
            {editing ? (
              <input
                ref={inputRef}
                className="text-5xl font-bold text-black text-center bg-white bg-opacity-90 rounded-xl px-4 py-2 outline-none border-2 border-[#ff8c00] flex items-center justify-center shadow-inner"
                value={editValue}
                onChange={handleEditChange}
                onBlur={handleEditBlurOrEnter}
                onKeyDown={handleEditKeyDown}
                maxLength={7}
                style={{ width: '8rem', textAlign: 'center' }}
                disabled={!editable}
              />
            ) : (
              <div className="flex flex-col items-center">
                <span 
                  className="text-6xl font-extrabold select-none flex items-center justify-center w-full"
                  style={{
                    color: '#000', 
                    textShadow: isRunning ? '0 2px 10px rgba(33, 150, 243, 0.6)' : 'none',
                    transition: 'color 0.3s, text-shadow 0.3s'
                  }}
                >
                  {pad(minutes)}:{pad(seconds)}
                </span>
                
                {isRunning && (
                  <span className="mt-2 text-sm text-[#8B4513] font-medium animate-pulse">
                    Time remaining
                  </span>
                )}
              </div>
            )}
          </div>
        </button>
      </div>
    </div>
  );
}