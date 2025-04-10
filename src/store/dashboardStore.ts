import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Note {
  id: string;
  content: string;
  createdAt: Date;
}

interface Task {
  id: string;
  content: string;
  completed: boolean;
}

interface DashboardState {
  activeSection: string;
  notes: Note[];
  tasks: Task[];
  darkMode: boolean;
  taskFilter: 'all' | 'active' | 'completed';
  setActiveSection: (section: string) => void;
  addNote: (content: string) => void;
  addTask: (content: string) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  deleteNote: (id: string) => void;
  setTaskFilter: (filter: 'all' | 'active' | 'completed') => void;
  toggleDarkMode: () => void;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      activeSection: 'Notes',
      notes: [],
      tasks: [],
      darkMode: false,
      taskFilter: 'all',
      setActiveSection: (section) => set({ activeSection: section }),
      addNote: (content) =>
        set((state) => ({
          notes: [
            ...state.notes,
            { id: crypto.randomUUID(), content, createdAt: new Date() },
          ],
        })),
      addTask: (content) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            { id: crypto.randomUUID(), content, completed: false },
          ],
        })),
      toggleTask: (id) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, completed: !task.completed } : task
          ),
        })),
      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        })),
      deleteNote: (id) =>
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
        })),
      setTaskFilter: (filter) => set({ taskFilter: filter }),
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
    }),
    {
      name: 'dashboard-storage',
    }
  )
);