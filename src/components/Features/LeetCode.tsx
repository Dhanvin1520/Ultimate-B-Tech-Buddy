import { useEffect, useState } from 'react';
import { ExternalLink, Trash2 } from 'lucide-react';
import api from '../../lib/api';

interface Problem {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  url: string;
  status?: 'solved' | 'attempted' | 'todo';
}

export default function LeetCode() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const guest = localStorage.getItem('guest') === 'true';

  useEffect(() => {
    if (guest) {
      const stored = localStorage.getItem('guest-lc');
      if (stored) setProblems(JSON.parse(stored));
      return;
    }
    const load = async () => {
      try {
        const res = await api.get('/leetcode');
        const list: Problem[] = res.data.map((p: any) => ({ id: p._id, title: p.title, difficulty: p.difficulty, url: p.url, status: p.status }));
        setProblems(list);
      } catch {}
    };
    load();
  }, []);

  useEffect(() => {
    if (guest) localStorage.setItem('guest-lc', JSON.stringify(problems));
  }, [problems]);

  const addProblem = async () => {
    if (!title.trim() || !url.trim()) return;
    if (guest) {
      const p: Problem = { id: crypto.randomUUID(), title, url, difficulty, status: 'todo' };
      setProblems((prev) => [p, ...prev]);
      setTitle('');
      setUrl('');
      setDifficulty('easy');
    } else {
      try {
        const res = await api.post('/leetcode', { problemId: title.toLowerCase().replace(/\s+/g, '-'), title, difficulty, url, status: 'todo' });
        const p = res.data;
        setProblems((prev) => [{ id: p._id, title: p.title, url: p.url, difficulty: p.difficulty, status: p.status }, ...prev]);
        setTitle('');
        setUrl('');
        setDifficulty('easy');
      } catch {}
    }
  };

  const toggleStatus = async (id: string) => {
    const current = problems.find((p) => p.id === id);
    if (!current) return;
    const next: Problem['status'] = current.status === 'solved' ? 'attempted' : current.status === 'attempted' ? 'todo' : 'solved';
    if (guest) {
      setProblems((prev) => prev.map((p) => (p.id === id ? { ...p, status: next } : p)));
    } else {
      try {
        await api.put(`/leetcode/${id}`, { status: next });
        setProblems((prev) => prev.map((p) => (p.id === id ? { ...p, status: next } : p)));
      } catch {}
    }
  };

  const removeProblem = async (id: string) => {
    if (guest) {
      setProblems((prev) => prev.filter((p) => p.id !== id));
    } else {
      try {
        await api.delete(`/leetcode/${id}`);
        setProblems((prev) => prev.filter((p) => p.id !== id));
      } catch {}
    }
  };

  const filteredProblems = problems.filter((problem) =>
    filter === 'all' || problem.difficulty.toLowerCase() === filter.toLowerCase()
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-xl p-6 rounded-xl border border-slate-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-slate-900">LeetCode Problems</h2>
        <div className="flex gap-2">
          {['all', 'easy', 'medium', 'hard'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1 rounded-lg capitalize ${
                filter === type
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-2">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="bg-white border border-slate-200 text-slate-900 rounded-lg px-3 py-2 placeholder-slate-400" />
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="URL" className="bg-white border border-slate-200 text-slate-900 rounded-lg px-3 py-2 placeholder-slate-400" />
        <div className="flex gap-2">
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as any)} className="bg-white border border-slate-200 text-slate-900 rounded-lg px-3 py-2 flex-1">
            <option value="easy">easy</option>
            <option value="medium">medium</option>
            <option value="hard">hard</option>
          </select>
          <button onClick={addProblem} className="px-3 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800">Add</button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredProblems.map((problem) => (
          <div
            key={problem.id}
            className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200"
          >
            <div className="cursor-pointer" onClick={() => toggleStatus(problem.id)}>
              <h3 className="text-slate-900 font-medium">{problem.title}</h3>
              <div className="flex gap-3 items-center">
                <span className={`text-sm ${getDifficultyColor(problem.difficulty)}`}>{problem.difficulty}</span>
                <span className="text-sm text-slate-600">{problem.status || 'todo'}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={problem.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
              <button onClick={() => removeProblem(problem.id)} className="p-2 text-slate-600 hover:text-red-600 transition-colors">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}