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

export default function SidebarTodo() {
  const [items, setItems] = useState<Item[]>([])
  const [text, setText] = useState<string>('')
  const [priority, setPriority] = useState<'low'|'medium'|'high'>('medium')
  const [open, setOpen] = useState(true);
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
        const list: Item[] = res.data.map((t: any) => ({ id: t._id, content: t.title, priority: (t.priority||'medium'), completed: !!t.completed }))
        setItems(list)
      } catch {}
    }
    load()
  }, [])

  useEffect(() => {
    if (guest) localStorage.setItem('sidebar-todos', JSON.stringify(items))
  }, [items])

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
        setItems((p) => [{ id: t._id, content: t.title, priority: t.priority||'medium', completed: !!t.completed }, ...p])
        setText('')
        setPriority('medium')
      } catch {}
    }
  }

  const toggle = async (id: string) => {
    const cur = items.find(i => i.id === id)
    if (!cur) return
    if (guest) {
      setItems((p) => p.map(i => i.id===id? { ...i, completed: !i.completed }: i))
    } else {
      try {
        await api.put(`/tasks/${id}`, { completed: !cur.completed })
        setItems((p) => p.map(i => i.id===id? { ...i, completed: !i.completed }: i))
      } catch {}
    }
  }

  const remove = async (id: string) => {
    if (guest) setItems((p) => p.filter(i => i.id !== id))
    else {
      try { await api.delete(`/tasks/${id}`); setItems((p) => p.filter(i => i.id !== id)) } catch {}
    }
  }

  const color = (p: Item['priority']) => p==='low'? 'bg-green-500': p==='medium'? 'bg-yellow-500': 'bg-red-500'

  return (
    <div className="glass-panel border-white/10 p-3 flex flex-col rounded-2xl">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between text-white px-1 py-2">
        <span className="font-semibold">Quick Todos</span>
        <span className="text-sm text-white/50">{open ? 'Hide' : 'Show'}</span>
      </button>

      {open && (
        <div className="mt-2 flex flex-col gap-2 min-h-0">
          <div className="flex gap-2 items-center min-w-0">
            <input
              value={text}
              onChange={handleTextChange}
              placeholder="Add a task"
              className="flex-1 min-w-0 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white"
            />
            <div className="flex items-center gap-2">
              <select
                value={priority}
                onChange={handlePriorityChange}
                className="rounded-xl border border-white/10 bg-black/20 px-2 py-2 text-white text-sm shrink-0 w-20"
              >
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
              </select>
              <button onClick={addItem} className="primary-btn px-2 py-1 text-xs flex-shrink-0">
                Add
              </button>
            </div>
          </div>

          <div className="mt-2 overflow-y-auto flex-1 max-h-44 pr-1 space-y-2">
            {items.map((it) => (
              <div key={it.id} className="flex items-center gap-2 rounded-lg border border-white/8 bg-black/20 px-2 py-2">
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${color(it.priority)}`} />
                <input
                  type="checkbox"
                  checked={it.completed}
                  onChange={() => toggle(it.id)}
                  className="rounded border-white/40 text-amber-300"
                />
                <span className={`flex-1 truncate ${it.completed ? 'text-white/40 line-through' : 'text-white/90'}`}>
                  {it.content}
                </span>
                <button onClick={() => remove(it.id)} className="text-white/40 hover:text-red-400 px-2">
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
