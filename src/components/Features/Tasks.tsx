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
    <div className="bg-white/70 backdrop-blur-xl p-6 rounded-xl border border-slate-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Tasks</h2>
        <div className="flex gap-2">
          {(['all', 'active', 'completed'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setTaskFilter(filter)}
              className={`px-3 py-1 rounded-lg capitalize ${
                taskFilter === filter
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          className="flex-1 bg-white text-slate-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-slate-600 border border-slate-200 placeholder-slate-400"
          placeholder="Add a new task..."
        />
        <button
          type="submit"
          className="p-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </form>

      <div className="space-y-2">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-2 bg-white p-3 rounded-lg group border border-slate-200"
          >
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTask(task.id)}
              className="rounded border-slate-400 text-slate-900 focus:ring-slate-700"
            />
            <span
              className={`flex-1 ${
                task.completed ? 'line-through text-slate-400' : 'text-slate-900'
              }`}
            >
              {task.content}
            </span>
            <button
              onClick={() => deleteTask(task.id)}
              className="text-slate-500 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}