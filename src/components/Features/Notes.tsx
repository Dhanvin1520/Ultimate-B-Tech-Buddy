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

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const normalizeNotes = (raw: any[]): Note[] =>
      raw
        .filter(Boolean)
        .map((note: any, index: number) => ({
          id: String(note?._id || note?.id || `note-${index}`),
          content: note?.content || note?.title || '',
          createdAt: note?.updatedAt || note?.createdAt || new Date().toISOString(),
        }))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const storedNotes = localStorage.getItem('my-notes');
    if (storedNotes) {
      try {
        setNotes(normalizeNotes(JSON.parse(storedNotes)));
      } catch {
        // ignore malformed cache
      }
    }

    if (guest) {
      setIsLoaded(true);
      return;
    }

    const load = async () => {
      try {
        const res = await api.get('/notes');
        const list: Note[] = Array.isArray(res.data) ? normalizeNotes(res.data) : [];
        setNotes(list);
      } catch (error) {
        console.error('Failed to fetch notes:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    load();
  }, [guest]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('my-notes', JSON.stringify(notes));
    }
  }, [notes, isLoaded]);

  const addNote = async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;

    if (guest) {
      const newNote: Note = { id: crypto.randomUUID(), content: trimmed, createdAt: new Date().toISOString() };
      setNotes((prevNotes) => [newNote, ...prevNotes]);
      return;
    }

    const tempId = crypto.randomUUID();
    const optimistic: Note = { id: tempId, content: trimmed, createdAt: new Date().toISOString() };
    setNotes((prevNotes) => [optimistic, ...prevNotes]);

    try {
      const res = await api.post('/notes', { title: trimmed.slice(0, 20) || 'Note', content: trimmed });
      const saved = res.data || {};
      const persisted: Note = {
        id: String(saved._id || tempId),
        content: saved.content || trimmed,
        createdAt: saved.createdAt || optimistic.createdAt,
      };
      setNotes((prevNotes) => prevNotes.map((note) => (note.id === tempId ? persisted : note)));
    } catch (error) {
      console.error('Failed to save note:', error);
    }
  };

  const deleteNote = async (id: string) => {
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));

    if (!guest) {
      try {
        await api.delete(`/notes/${id}`);
      } catch { }
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
      <form onSubmit={handleSubmit} className="swiss-card p-6">
        <h2 className="heading-lg heading-gamer mb-4">New Note</h2>
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          className="input-swiss h-36 resize-none"
          placeholder="Write your note here..."
        />
        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            className="btn-primary"
          >
            Save Note
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {notes.map((note) => (
          <div key={note.id} className="swiss-card p-6 hover:border-[var(--border-strong)] transition-colors">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest">
                {format(new Date(note.createdAt), 'MMM d, yyyy h:mm a')}
              </span>
              <button
                onClick={() => deleteNote(note.id)}
                className="text-[var(--text-secondary)] hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <p className="whitespace-pre-wrap text-[var(--text-primary)] leading-relaxed">{note.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}