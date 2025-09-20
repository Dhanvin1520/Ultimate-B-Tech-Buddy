import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import api from '../../lib/api';

interface Note {
  id: string;
  content: string;
  createdAt: string; 
}

export default function Notes() {
  const [newNote, setNewNote] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const guest = localStorage.getItem('guest') === 'true';

  useEffect(() => {
    if (guest) {
      const storedNotes = localStorage.getItem('my-notes');
      if (storedNotes) setNotes(JSON.parse(storedNotes));
      return;
    }
    const load = async () => {
      try {
        const res = await api.get('/notes');
        const list: Note[] = res.data.map((n: any) => ({ id: n._id, content: n.content || n.title || '', createdAt: n.createdAt || new Date().toISOString() }));
        setNotes(list);
      } catch {}
    };
    load();
  }, []);

  useEffect(() => {
    if (guest) localStorage.setItem('my-notes', JSON.stringify(notes));
  }, [notes]);

  const addNote = async (content: string) => {
    if (guest) {
      const newNote: Note = { id: crypto.randomUUID(), content, createdAt: new Date().toISOString() };
      setNotes((prevNotes) => [newNote, ...prevNotes]);
    } else {
      try {
        const res = await api.post('/notes', { title: content.slice(0, 20) || 'Note', content });
        const n = res.data;
        setNotes((prev) => [{ id: n._id, content: n.content || '', createdAt: n.createdAt || new Date().toISOString() }, ...prev]);
      } catch {}
    }
  };

  const deleteNote = async (id: string) => {
    if (guest) {
      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
    } else {
      try {
        await api.delete(`/notes/${id}`);
        setNotes((prev) => prev.filter((n) => n.id !== id));
      } catch {}
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNote.trim()) {
      addNote(newNote);
      setNewNote('');
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="bg-white/70 backdrop-blur-xl p-6 rounded-xl border border-slate-200">
        <h2 className="text-xl font-semibold mb-4 text-slate-900">New Note</h2>
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          className="w-full h-32 bg-white border border-slate-200 text-slate-900 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-slate-600 placeholder-slate-400"
          placeholder="Write your note here..."
        />
        <button
          type="submit"
          className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          Save Note
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {notes.map((note) => (
          <div key={note.id} className="bg-white/70 backdrop-blur-xl p-6 rounded-xl border border-slate-200">
            <div className="flex justify-between items-start mb-3">
              <span className="text-sm text-slate-500">
                {format(new Date(note.createdAt), 'MMM d, yyyy h:mm a')}
              </span>
              <button
                onClick={() => deleteNote(note.id)}
                className="text-slate-600 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-slate-900 whitespace-pre-wrap">{note.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}