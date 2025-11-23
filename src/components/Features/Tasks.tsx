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

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (guest) {
      const stored = localStorage.getItem('guest-tasks');
      if (stored) setTasks(JSON.parse(stored));
    } else {
      const load = async () => {
        try {
          const res = await api.get('/tasks');
          const list: Task[] = res.data.map((t: any) => ({ id: t._id, content: t.title, completed: !!t.completed }));
          setTasks(list);
        } catch { }
      };
      load();
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (guest && isLoaded) localStorage.setItem('guest-tasks', JSON.stringify(tasks));
  }, [tasks, isLoaded]);

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
        } catch { }
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
      } catch { }
    }
  };

  const deleteTask = async (id: string) => {
    if (guest) {
      setTasks((prev) => prev.filter((task) => task.id !== id));
    } else {
      try {
        await api.delete(`/tasks/${id}`);
        setTasks((prev) => prev.filter((task) => task.id !== id));
      } catch { }
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (taskFilter === 'active') return !task.completed;
    if (taskFilter === 'completed') return task.completed;
    return true;
  });

  return (
    <div className="swiss-card p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="heading-lg heading-gamer">Tasks</h2>
        <div className="flex gap-2">
          {(['all', 'active', 'completed'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setTaskFilter(filter)}
              className={`px-4 py-2 text-sm font-bold uppercase tracking-widest transition-colors ${taskFilter === filter
                ? 'bg-[var(--accent-color)] text-white'
                : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]'
                }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mb-8 flex gap-3">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          className="input-swiss flex-1"
          placeholder="Add a new task..."
        />
        <button
          type="submit"
          className="btn-primary h-auto"
        >
          <Plus className="w-5 h-5" />
        </button>
      </form>

      <div className="space-y-3">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className="group flex items-center gap-4 p-4 border-b border-[var(--border-color)] hover:bg-[var(--bg-subtle)] transition-colors"
          >
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTask(task.id)}
              className="w-5 h-5 rounded-none border-2 border-[var(--text-secondary)] text-[var(--accent-color)] focus:ring-0 focus:ring-offset-0 checked:bg-[var(--accent-color)] checked:border-[var(--accent-color)] transition-colors cursor-pointer"
            />
            <span
              className={`flex-1 text-sm font-medium ${task.completed ? 'text-[var(--text-tertiary)] line-through' : 'text-[var(--text-primary)]'
                }`}
            >
              {task.content}
            </span>
            <button
              onClick={() => deleteTask(task.id)}
              className="text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 hover:text-red-600 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {filteredTasks.length === 0 && (
          <p className="text-center text-[var(--text-tertiary)] text-sm py-8 italic">No tasks found.</p>
        )}
      </div>
    </div>
  );
}