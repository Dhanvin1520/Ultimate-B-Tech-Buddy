import React, { useEffect, useState } from 'react';
import api from '../lib/api';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

interface Item {
  id: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
}

export type SidebarTodoItem = Item;

interface SidebarTodoProps {
  onItemsChange?: (items: Item[]) => void;
  initialOpen?: boolean;
}

export default function SidebarTodo({ onItemsChange, initialOpen = true }: SidebarTodoProps = {}) {
  const [items, setItems] = useState<Item[]>([])
  const [text, setText] = useState<string>('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [open, setOpen] = useState(initialOpen);
  const guest = localStorage.getItem('guest') === 'true';

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  };

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPriority(e.target.value as 'low' | 'medium' | 'high');
  };

  useEffect(() => {
    if (guest) {
      const s = localStorage.getItem('sidebar-todos')
      if (s) setItems(JSON.parse(s))
      return
    }
    const load = async () => {
      try {
        const res = await api.get('/tasks')
        const list: Item[] = res.data.map((t: any) => ({ id: t._id, content: t.title, priority: (t.priority || 'medium'), completed: !!t.completed }))
        setItems(list)
      } catch { }
    }
    load()
  }, [])

  useEffect(() => {
    if (guest) localStorage.setItem('sidebar-todos', JSON.stringify(items))
  }, [items])

  useEffect(() => {
    onItemsChange?.(items);
  }, [items, onItemsChange]);

  const addItem = async () => {
    if (!text.trim()) return
    if (guest) {
      const it: Item = { id: crypto.randomUUID(), content: text, priority, completed: false }
      setItems((p) => [it, ...p])
      setText('')
      setPriority('medium')
    } else {
      try {
        const res = await api.post('/tasks', { title: text, priority, completed: false })
        const t = res.data
        setItems((p) => [{ id: t._id, content: t.title, priority: t.priority || 'medium', completed: !!t.completed }, ...p])
        setText('')
        setPriority('medium')
      } catch { }
    }
  }

  const toggle = async (id: string) => {
    const cur = items.find(i => i.id === id)
    if (!cur) return
    if (guest) {
      setItems((p) => p.map(i => i.id === id ? { ...i, completed: !i.completed } : i))
    } else {
      try {
        await api.put(`/tasks/${id}`, { completed: !cur.completed })
        setItems((p) => p.map(i => i.id === id ? { ...i, completed: !i.completed } : i))
      } catch { }
    }
  }

  const remove = async (id: string) => {
    if (guest) setItems((p) => p.filter(i => i.id !== id))
    else {
      try { await api.delete(`/tasks/${id}`); setItems((p) => p.filter(i => i.id !== id)) } catch { }
    }
  }

  const color = (p: Item['priority']) => p === 'low' ? 'bg-emerald-500' : p === 'medium' ? 'bg-amber-500' : 'bg-rose-500'

  return (
    <div className="bg-white/5 border border-white/5 p-3 flex flex-col rounded-xl">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between text-slate-300 hover:text-white transition-colors px-1 py-1 mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider">Quick Tasks</span>
        <span className="text-[10px] opacity-70">{open ? 'Hide' : 'Show'}</span>
      </button>

      {open && (
        <div className="flex flex-col gap-3 min-h-0 animate-fade-in">
          <div className="flex gap-2 items-center min-w-0">
            <input
              value={text}
              onChange={handleTextChange}
              placeholder="New task..."
              className="flex-1 min-w-0 rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500/50 focus:outline-none transition-colors"
            />
            <button onClick={addItem} className="bg-indigo-500 hover:bg-indigo-600 text-white p-1.5 rounded-lg transition-colors flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
            </button>
          </div>

          <div className="flex gap-2">
            <select
              value={priority}
              onChange={handlePriorityChange}
              className="flex-1 rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-slate-300 text-xs focus:outline-none cursor-pointer hover:bg-black/60 transition-colors"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>

          <div className="overflow-y-auto flex-1 max-h-48 pr-1 space-y-2 custom-scrollbar">
            {items.length === 0 && (
              <p className="text-center text-xs text-slate-500 py-2">No tasks yet</p>
            )}
            {items.map((it) => (
              <div key={it.id} className="group flex items-center gap-3 rounded-lg border border-white/5 bg-white/5 px-3 py-2 hover:bg-white/10 transition-colors">
                <button
                  onClick={() => toggle(it.id)}
                  className={`h-4 w-4 shrink-0 rounded-full border ${it.completed ? 'bg-indigo-500 border-indigo-500' : 'border-slate-500'} flex items-center justify-center transition-colors`}
                >
                  {it.completed && <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white"><polyline points="20 6 9 17 4 12" /></svg>}
                </button>

                <div className="flex-1 min-w-0 flex flex-col">
                  <span className={`text-sm truncate ${it.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                    {it.content}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${color(it.priority)}`} />
                    <span className="text-[10px] text-slate-500 capitalize">{it.priority}</span>
                  </div>
                </div>

                <button onClick={() => remove(it.id)} className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
