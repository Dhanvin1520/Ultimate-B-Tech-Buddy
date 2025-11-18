import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import api from '../../lib/api';

type Task = {
  id: string;
  content: string;
  completed: boolean;
};

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [taskFilter, setTaskFilter] = useState<'all' | 'active' | 'completed'>('all');
  const guest = localStorage.getItem('guest') === 'true';

  useEffect(() => {
    if (guest) {
      const stored = localStorage.getItem('guest-tasks');
      if (stored) setTasks(JSON.parse(stored));
      return;
    }
    const load = async () => {
      try {
        const res = await api.get('/tasks');
        const list: Task[] = res.data.map((t: any) => ({ id: t._id, content: t.title, completed: !!t.completed }));
        setTasks(list);
      } catch {}
    };
    load();
  }, []);

  useEffect(() => {
    if (guest) localStorage.setItem('guest-tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim()) {
      if (guest) {
        const newTaskItem: Task = { id: crypto.randomUUID(), content: newTask, completed: false };
        setTasks((prev) => [...prev, newTaskItem]);
      } else {
        try {
          const res = await api.post('/tasks', { title: newTask, completed: false });
          const t = res.data;
          setTasks((prev) => [...prev, { id: t._id, content: t.title, completed: !!t.completed }]);
        } catch {}
      }
      setNewTask('');
    }
  };

  const toggleTask = async (id: string) => {
    const current = tasks.find((t) => t.id === id);
    if (!current) return;
    const nextCompleted = !current.completed;
    if (guest) {
      setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, completed: nextCompleted } : task)));
    } else {
      try {
        await api.put(`/tasks/${id}`, { completed: nextCompleted });
        setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, completed: nextCompleted } : task)));
      } catch {}
    }
  };

  const deleteTask = async (id: string) => {
    if (guest) {
      setTasks((prev) => prev.filter((task) => task.id !== id));
    } else {
      try {
        await api.delete(`/tasks/${id}`);
        setTasks((prev) => prev.filter((task) => task.id !== id));
      } catch {}
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (taskFilter === 'active') return !task.completed;
    if (taskFilter === 'completed') return task.completed;
    return true;
  });

  return (
    <div className="glass-panel border-white/10 p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="panel-title text-2xl">Tasks</h2>
        <div className="flex gap-2">
          {(['all', 'active', 'completed'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setTaskFilter(filter)}
              className={`rounded-2xl px-4 py-2 capitalize ${
                taskFilter === filter
                  ? 'bg-amber-500/20 text-white shadow-inner'
                  : 'border border-white/10 text-white/60 hover:text-white'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mb-6 flex gap-3">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          className="flex-1 rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40"
          placeholder="Add a new task..."
        />
        <button
          type="submit"
          className="primary-btn"
        >
          <Plus className="w-5 h-5" />
        </button>
      </form>

      <div className="space-y-2">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className="group flex items-center gap-3 rounded-3xl border border-white/5 bg-white/5 p-4"
          >
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTask(task.id)}
              className="rounded border-white/30 text-amber-300"
            />
            <span
              className={`flex-1 text-sm ${
                task.completed ? 'text-white/40 line-through' : 'text-white/80'
              }`}
            >
              {task.content}
            </span>
            <button
              onClick={() => deleteTask(task.id)}
              className="text-white/40 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-300"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}