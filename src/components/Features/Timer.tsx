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
    <div className="bg-gray-800 p-6 rounded-xl">
      <h2 className="text-xl font-semibold mb-6 text-white">Timer</h2>
      
      <div className="flex justify-center mb-8">
        <div className="text-5xl font-bold text-white font-mono">
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
        </button>
        <button
          onClick={() => handleReset(Math.floor(timeLeft / 60))}
          className="p-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          <RefreshCw className="w-6 h-6" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {presets.map((preset) => (
          <button
            key={preset.label}
            onClick={() => handleReset(preset.minutes)}
            className="py-2 px-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}