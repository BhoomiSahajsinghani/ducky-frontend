import React, { useState, useRef, useEffect } from "react";

interface ClockTimerProps {
  initialMinutes?: number;
  editable?: boolean;
  onMinutesChange?: (minutes: number) => void;
}

const MAX_MINUTES = 180;
const MIN_MINUTES = 1;
const WAVE_COLOR = "#A7C7E7"; // Pastel blue
const CIRCLE_COLOR = "#000";
const WIDTH = 280;
const HEIGHT = 280;
const RADIUS = 130;

function pad(num: number): string {
  return num < 10 ? `0${num}` : `${num}`;
}

export default function ClockTimer({ initialMinutes = 25, editable = true, onMinutesChange }: ClockTimerProps) {
  const [minutes, setMinutes] = useState(initialMinutes);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
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
    if (totalSeconds <= 0) {
      setIsRunning(false);
      return;
    }
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
  const waveAmplitude = 8;
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
    setMinutes((m) => {
      const newM = m < MAX_MINUTES ? m + 1 : m;
      if (onMinutesChange) onMinutesChange(newM);
      return newM;
    });
    setSeconds(0);
  };

  const handleDecrement = () => {
    if (isRunning || !editable) return;
    setMinutes((m) => {
      const newM = m > MIN_MINUTES ? m - 1 : m;
      if (onMinutesChange) onMinutesChange(newM);
      return newM;
    });
    setSeconds(0);
  };

  const handleStartPause = () => {
    if (totalSeconds > 0) setIsRunning((r) => !r);
  };

  const handleReset = () => {
    setIsRunning(false);
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
      <div className="relative w-64 h-64 flex items-center justify-center cursor-pointer group" onClick={handleCircleClick}>
        <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="absolute top-0 left-0">
          <circle
            cx={WIDTH / 2}
            cy={HEIGHT / 2}
            r={RADIUS}
            stroke={CIRCLE_COLOR}
            strokeWidth="6"
            fill="none"
          />
          <clipPath id="clipCircle">
            <circle cx={WIDTH / 2} cy={HEIGHT / 2} r={RADIUS - 3} />
          </clipPath>
          <g clipPath="url(#clipCircle)">
            <path d={getWavePath()} fill={WAVE_COLOR} />
          </g>
        </svg>
        <div className="absolute w-full h-full flex flex-col items-center justify-center">
          <span className="text-base text-gray-700 mb-2 select-none">Sprint time</span>
          {editing ? (
            <input
              ref={inputRef}
              className="text-6xl font-bold text-black text-center bg-white bg-opacity-80 rounded px-4 py-2 outline-none border-2 border-yellow-400 flex items-center justify-center"
              value={editValue}
              onChange={handleEditChange}
              onBlur={handleEditBlurOrEnter}
              onKeyDown={handleEditKeyDown}
              maxLength={7}
              style={{ width: '8.5rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              disabled={!editable}
            />
          ) : (
            <span className="text-6xl font-extrabold text-white select-none flex items-center justify-center w-full" style={{textShadow:'0 2px 8px #0008', textAlign:'center'}}>
              {pad(minutes)}:{pad(seconds)}
            </span>
          )}
        </div>
      </div>
      <div className="flex gap-8 mt-8">
        <button
          onClick={handleDecrement}
          className="w-12 h-12 rounded-full bg-gray-200 hover:bg-gray-300 text-3xl font-bold text-black flex items-center justify-center shadow"
          aria-label="Decrease minutes"
          disabled={isRunning || !editable}
        >
          −
        </button>
        <button
          onClick={handleIncrement}
          className="w-12 h-12 rounded-full bg-gray-200 hover:bg-gray-300 text-3xl font-bold text-black flex items-center justify-center shadow"
          aria-label="Increase minutes"
          disabled={isRunning || !editable}
        >
          +
        </button>
      </div>
      <div className="flex gap-8 mt-6">
        <button
          onClick={handleReset}
          className="w-12 h-12 rounded-full bg-yellow-500 hover:bg-yellow-600 text-white flex items-center justify-center shadow text-xl"
          aria-label="Reset"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
        </button>
        <button
          onClick={handleStartPause}
          className="w-16 h-16 rounded-full bg-yellow-500 hover:bg-yellow-600 text-white flex items-center justify-center shadow text-3xl font-bold"
          aria-label={isRunning ? "Pause" : "Start"}
        >
          {isRunning ? (
            <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><rect x="8" y="8" width="6" height="16" rx="2"/><rect x="18" y="8" width="6" height="16" rx="2"/></svg>
          ) : (
            <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polygon points="10,8 26,16 10,24"/></svg>
          )}
        </button>
      </div>
    </div>
  );
}
