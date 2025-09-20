import { useEffect, useState } from 'react'
import api from '../lib/api'

type Item = { id: string; content: string; priority: 'low'|'medium'|'high'; completed: boolean }

export default function SidebarTodo() {
  const [items, setItems] = useState<Item[]>([])
  const [text, setText] = useState('')
  const [priority, setPriority] = useState<'low'|'medium'|'high'>('medium')
  const [open, setOpen] = useState(true)
  const guest = localStorage.getItem('guest') === 'true'

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
    <div className="p-3 border-t border-slate-200">
      <button onClick={() => setOpen(o=>!o)} className="w-full text-left text-slate-900 font-semibold flex justify-between items-center">
        <span>Todo</span>
        <span className="text-sm text-slate-600">{open? 'Hide': 'Show'}</span>
      </button>
      {open && (
        <div className="mt-2 space-y-2">
          <div className="flex gap-2 md:flex-row flex-col">
            <input value={text} onChange={(e)=>setText(e.target.value)} placeholder="Add" className="flex-1 w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400" />
            <div className="flex gap-2">
              <select value={priority} onChange={(e)=>setPriority(e.target.value as any)} className="bg-white border border-slate-200 rounded-lg px-2 py-2 text-slate-900 w-full md:w-auto">
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
              </select>
              <button onClick={addItem} className="px-3 py-2 bg-slate-900 text-white rounded-lg w-full md:w-auto">Add</button>
            </div>
          </div>
          <div className="space-y-2 max-h-40 md:max-h-56 overflow-auto pr-1">
            {items.map(it => (
              <div key={it.id} className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 p-2">
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${color(it.priority)}`} />
                <input type="checkbox" checked={it.completed} onChange={()=>toggle(it.id)} className="rounded border-slate-400 text-slate-900 shrink-0" />
                <span className={`flex-1 text-sm truncate ${it.completed? 'line-through text-slate-400':'text-slate-900'}`}>{it.content}</span>
                <button onClick={()=>remove(it.id)} className="text-slate-500 hover:text-red-600 text-xs shrink-0">x</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
