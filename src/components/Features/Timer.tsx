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
    <div className="glass-panel p-6">
      <h2 className="panel-title text-2xl">Timer</h2>

      <div className="my-8 flex justify-center">
        <div className="rounded-3xl border border-white/10 bg-black/40 px-10 py-6 font-mono text-6xl tracking-[0.3em] text-white">
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="mb-8 flex justify-center gap-4">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="primary-btn h-14 w-14 rounded-2xl"
        >
          {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
        </button>
        <button
          onClick={() => handleReset(Math.floor(timeLeft / 60))}
          className="ghost-btn h-14 w-14 rounded-2xl"
        >
          <RefreshCw className="w-6 h-6" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {presets.map((preset) => (
          <button
            key={preset.label}
            onClick={() => handleReset(preset.minutes)}
            className="rounded-2xl border border-white/10 bg-white/5 py-3 text-sm text-white/80 hover:border-white/40"
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}