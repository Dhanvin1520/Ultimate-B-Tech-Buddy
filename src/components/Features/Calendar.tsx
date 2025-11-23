import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  return (
    <div className="swiss-card p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-1">Calendar</p>
          <h2 className="heading-xl">{format(currentDate, 'MMMM yyyy')}</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
            className="btn-outline"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
            className="btn-primary"
          >
            Next
          </button>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-7 gap-2 text-center text-xs font-bold uppercase tracking-widest text-[var(--text-tertiary)]">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="py-2">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px bg-[var(--border-color)] border border-[var(--border-color)]">
        {days.map((day) => {
          const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
          return (
            <div
              key={day.toISOString()}
              className={`h-32 p-2 bg-[var(--bg-panel)] transition-colors hover:bg-[var(--bg-subtle)] flex flex-col items-start justify-between ${isToday ? 'bg-[var(--bg-subtle)]' : ''
                }`}
            >
              <span className={`text-sm font-bold ${isToday ? 'text-[var(--accent-color)]' : 'text-[var(--text-primary)]'}`}>
                {format(day, 'd')}
              </span>
              {isToday && <div className="w-2 h-2 bg-[var(--accent-color)] rounded-full self-end" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}