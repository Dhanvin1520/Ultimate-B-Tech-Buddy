import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useDashboardStore } from '../../store/dashboardStore';

export default function Tasks() {
  const [newTask, setNewTask] = useState('');
  const { tasks, addTask, toggleTask, deleteTask } = useDashboardStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim()) {
      addTask(newTask);
      setNewTask('');
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl">
      <h2 className="text-xl font-semibold mb-4 text-white">Tasks</h2>
      
      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Add a new task..."
        />
        <button
          type="submit"
          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </form>

      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-2 bg-gray-700 p-3 rounded-lg group"
          >
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTask(task.id)}
              className="rounded border-gray-500 text-blue-500 focus:ring-blue-500"
            />
            <span
              className={`flex-1 ${
                task.completed ? 'line-through text-gray-400' : 'text-white'
              }`}
            >
              {task.content}
            </span>
            <button
              onClick={() => deleteTask(task.id)}
              className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}