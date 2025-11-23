import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RefreshCw } from 'lucide-react';

type TimerPreset = {
  label: string;
  minutes: number;
};

export default function Timer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const presets: TimerPreset[] = [
    { label: 'Pomodoro', minutes: 25 },
    { label: 'Short Break', minutes: 5 },
    { label: 'Long Break', minutes: 15 },
  ];

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (isRunning && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleReset = (minutes: number) => {
    setIsRunning(false);
    setTimeLeft(minutes * 60);
  };

  return (
    <div className="swiss-card p-8 flex flex-col items-center justify-center min-h-[400px]">
      <h2 className="heading-lg mb-8">Focus Timer</h2>

      <div className="mb-10 flex justify-center">
        <div className="text-8xl font-bold tracking-tighter text-[var(--text-primary)] font-mono tabular-nums">
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="mb-10 flex justify-center gap-6">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="btn-primary h-16 w-16 rounded-full flex items-center justify-center"
        >
          {isRunning ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
        </button>
        <button
          onClick={() => handleReset(Math.floor(timeLeft / 60))}
          className="btn-outline h-16 w-16 rounded-full flex items-center justify-center"
        >
          <RefreshCw className="w-6 h-6" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 w-full max-w-md">
        {presets.map((preset) => (
          <button
            key={preset.label}
            onClick={() => handleReset(preset.minutes)}
            className="py-3 px-4 text-sm font-bold uppercase tracking-widest border border-[var(--border-color)] hover:bg-[var(--bg-subtle)] hover:border-[var(--text-primary)] transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}