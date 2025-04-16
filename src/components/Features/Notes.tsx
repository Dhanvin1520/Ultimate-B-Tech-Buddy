import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface Note {
  id: string;
  content: string;
  createdAt: string; 
}

export default function Notes() {
  const [newNote, setNewNote] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);


  useEffect(() => {
    const storedNotes = localStorage.getItem('my-notes');
    if (storedNotes) {
      setNotes(JSON.parse(storedNotes));
    }
  }, []);


  useEffect(() => {
    localStorage.setItem('my-notes', JSON.stringify(notes));
  }, [notes]);

  const addNote = (content: string) => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      content,
      createdAt: new Date().toISOString(),
    };
    setNotes((prevNotes) => [newNote, ...prevNotes]);
  };

  const deleteNote = (id: string) => {
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
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
      <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-xl">
        <h2 className="text-xl font-semibold mb-4 text-white">New Note</h2>
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          className="w-full h-32 bg-gray-700 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Write your note here..."
        />
        <button
          type="submit"
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Save Note
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {notes.map((note) => (
          <div key={note.id} className="bg-gray-800 p-6 rounded-xl">
            <div className="flex justify-between items-start mb-3">
              <span className="text-sm text-gray-400">
                {format(new Date(note.createdAt), 'MMM d, yyyy h:mm a')}
              </span>
              <button
                onClick={() => deleteNote(note.id)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-white whitespace-pre-wrap">{note.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}