import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  return (
    <div className="glass-panel p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-white/40">Calendar</p>
          <h2 className="panel-title text-2xl">{format(currentDate, 'MMMM yyyy')}</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
            className="ghost-btn"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
            className="primary-btn"
          >
            Next
          </button>
        </div>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-2 text-center text-xs uppercase tracking-[0.3em] text-white/30">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => (
          <button
            key={day.toISOString()}
            className={`rounded-2xl border px-3 py-4 text-center text-sm transition-colors ${
              format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                ? 'border-amber-400/60 bg-amber-500/10 text-white shadow-inner'
                : 'border-white/5 bg-white/5 text-white/70 hover:border-white/20 hover:text-white'
            }`}
          >
            {format(day, 'd')}
          </button>
        ))}
      </div>
    </div>
  );
}