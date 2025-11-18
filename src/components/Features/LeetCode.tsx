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

  const CURATED: Problem[] = [
    { id: '1', title: 'Two Sum', difficulty: 'easy', url: 'https://leetcode.com/problems/two-sum', status: 'todo' },
    { id: '2', title: 'Add Two Numbers', difficulty: 'medium', url: 'https://leetcode.com/problems/add-two-numbers', status: 'todo' },
    { id: '3', title: 'Longest Substring Without Repeating Characters', difficulty: 'medium', url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters', status: 'todo' },
    { id: '4', title: 'Median of Two Sorted Arrays', difficulty: 'hard', url: 'https://leetcode.com/problems/median-of-two-sorted-arrays', status: 'todo' },
    { id: '5', title: 'Longest Palindromic Substring', difficulty: 'medium', url: 'https://leetcode.com/problems/longest-palindromic-substring', status: 'todo' },
    { id: '6', title: 'Zigzag Conversion', difficulty: 'medium', url: 'https://leetcode.com/problems/zigzag-conversion', status: 'todo' },
    { id: '7', title: 'Reverse Integer', difficulty: 'easy', url: 'https://leetcode.com/problems/reverse-integer', status: 'todo' },
    { id: '8', title: 'String to Integer (atoi)', difficulty: 'medium', url: 'https://leetcode.com/problems/string-to-integer-atoi', status: 'todo' },
    { id: '9', title: 'Palindrome Number', difficulty: 'easy', url: 'https://leetcode.com/problems/palindrome-number', status: 'todo' },
    { id: '10', title: 'Regular Expression Matching', difficulty: 'hard', url: 'https://leetcode.com/problems/regular-expression-matching', status: 'todo' },
    { id: '11', title: 'Container With Most Water', difficulty: 'medium', url: 'https://leetcode.com/problems/container-with-most-water', status: 'todo' },
    { id: '12', title: 'Integer to Roman', difficulty: 'medium', url: 'https://leetcode.com/problems/integer-to-roman', status: 'todo' },
    { id: '13', title: 'Roman to Integer', difficulty: 'easy', url: 'https://leetcode.com/problems/roman-to-integer', status: 'todo' },
    { id: '14', title: 'Longest Common Prefix', difficulty: 'easy', url: 'https://leetcode.com/problems/longest-common-prefix', status: 'todo' },
    { id: '15', title: '3Sum', difficulty: 'medium', url: 'https://leetcode.com/problems/3sum', status: 'todo' },
    { id: '16', title: '3Sum Closest', difficulty: 'medium', url: 'https://leetcode.com/problems/3sum-closest', status: 'todo' },
    { id: '17', title: 'Letter Combinations of a Phone Number', difficulty: 'medium', url: 'https://leetcode.com/problems/letter-combinations-of-a-phone-number', status: 'todo' },
    { id: '18', title: '4Sum', difficulty: 'medium', url: 'https://leetcode.com/problems/4sum', status: 'todo' },
    { id: '19', title: 'Remove Nth Node From End of List', difficulty: 'medium', url: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list', status: 'todo' },
    { id: '20', title: 'Valid Parentheses', difficulty: 'easy', url: 'https://leetcode.com/problems/valid-parentheses', status: 'todo' },
    { id: '21', title: 'Merge Two Sorted Lists', difficulty: 'easy', url: 'https://leetcode.com/problems/merge-two-sorted-lists', status: 'todo' },
    { id: '22', title: 'Generate Parentheses', difficulty: 'medium', url: 'https://leetcode.com/problems/generate-parentheses', status: 'todo' },
    { id: '23', title: 'Swap Nodes in Pairs', difficulty: 'medium', url: 'https://leetcode.com/problems/swap-nodes-in-pairs', status: 'todo' },
    { id: '24', title: 'Reverse Nodes in k-Group', difficulty: 'hard', url: 'https://leetcode.com/problems/reverse-nodes-in-k-group', status: 'todo' },
    { id: '25', title: 'Remove Duplicates from Sorted Array', difficulty: 'easy', url: 'https://leetcode.com/problems/remove-duplicates-from-sorted-array', status: 'todo' },
    { id: '26', title: 'Remove Element', difficulty: 'easy', url: 'https://leetcode.com/problems/remove-element', status: 'todo' },
    { id: '27', title: 'Implement strStr()', difficulty: 'easy', url: 'https://leetcode.com/problems/implement-strstr', status: 'todo' },
    { id: '28', title: 'Divide Two Integers', difficulty: 'medium', url: 'https://leetcode.com/problems/divide-two-integers', status: 'todo' },
    { id: '29', title: 'Substring with Concatenation of All Words', difficulty: 'hard', url: 'https://leetcode.com/problems/substring-with-concatenation-of-all-words', status: 'todo' },
    { id: '30', title: 'Next Permutation', difficulty: 'medium', url: 'https://leetcode.com/problems/next-permutation', status: 'todo' },
    { id: '31', title: 'Search in Rotated Sorted Array', difficulty: 'medium', url: 'https://leetcode.com/problems/search-in-rotated-sorted-array', status: 'todo' },
    { id: '32', title: 'Find First and Last Position of Element in Sorted Array', difficulty: 'medium', url: 'https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array', status: 'todo' },
    { id: '33', title: 'Search Insert Position', difficulty: 'easy', url: 'https://leetcode.com/problems/search-insert-position', status: 'todo' },
    { id: '34', title: 'Valid Sudoku', difficulty: 'medium', url: 'https://leetcode.com/problems/valid-sudoku', status: 'todo' },
    { id: '35', title: 'Sudoku Solver', difficulty: 'hard', url: 'https://leetcode.com/problems/sudoku-solver', status: 'todo' },
    { id: '36', title: 'Count and Say', difficulty: 'easy', url: 'https://leetcode.com/problems/count-and-say', status: 'todo' },
    { id: '37', title: 'Combination Sum', difficulty: 'medium', url: 'https://leetcode.com/problems/combination-sum', status: 'todo' },
    { id: '38', title: 'Combination Sum II', difficulty: 'medium', url: 'https://leetcode.com/problems/combination-sum-ii', status: 'todo' },
    { id: '39', title: 'Word Search', difficulty: 'medium', url: 'https://leetcode.com/problems/word-search', status: 'todo' },
    { id: '40', title: 'Minimum Path Sum', difficulty: 'medium', url: 'https://leetcode.com/problems/minimum-path-sum', status: 'todo' },
    { id: '41', title: 'Climbing Stairs', difficulty: 'easy', url: 'https://leetcode.com/problems/climbing-stairs', status: 'todo' },
    { id: '42', title: 'Minimum Window Substring', difficulty: 'hard', url: 'https://leetcode.com/problems/minimum-window-substring', status: 'todo' },
    { id: '43', title: 'Decode Ways', difficulty: 'medium', url: 'https://leetcode.com/problems/decode-ways', status: 'todo' },
    { id: '44', title: 'Unique Paths', difficulty: 'medium', url: 'https://leetcode.com/problems/unique-paths', status: 'todo' },
    { id: '45', title: 'House Robber', difficulty: 'medium', url: 'https://leetcode.com/problems/house-robber', status: 'todo' },
    { id: '46', title: 'House Robber II', difficulty: 'medium', url: 'https://leetcode.com/problems/house-robber-ii', status: 'todo' },
    { id: '47', title: 'Longest Increasing Subsequence', difficulty: 'medium', url: 'https://leetcode.com/problems/longest-increasing-subsequence', status: 'todo' },
    { id: '48', title: 'Coin Change', difficulty: 'medium', url: 'https://leetcode.com/problems/coin-change', status: 'todo' },
    { id: '49', title: 'Product of Array Except Self', difficulty: 'medium', url: 'https://leetcode.com/problems/product-of-array-except-self', status: 'todo' },
    { id: '50', title: 'Find Minimum in Rotated Sorted Array', difficulty: 'medium', url: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array', status: 'todo' },
  ];

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

  // seed curated problems for guests (only if no stored list)
  useEffect(() => {
    if (!guest) return;
    if (problems.length > 0) return;
    setProblems(CURATED.map((p) => ({ ...p })));
  }, [guest, problems.length]);

  useEffect(() => {
    if (guest) localStorage.setItem('guest-lc', JSON.stringify(problems));
  }, [problems]);

  const solvedCount = problems.filter((p) => p.status === 'solved').length;
  const total = problems.length || 1;
  const progress = Math.round((solvedCount / total) * 100);

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
    <div className="glass-panel border-white/10 p-6 flex flex-col gap-6">
      <div className="mb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="panel-title text-2xl">LeetCode Problems</h2>
          <div className="mt-2 flex items-center gap-3">
            <div className="pill">{solvedCount} solved</div>
            <div className="muted">{total} problems</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-48 h-3 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-400 to-amber-600" style={{ width: `${Math.max(6, Math.min(100, Math.round((solvedCount / total) * 100)))}%` }} />
          </div>

          <div className="flex gap-2">
            {['all', 'easy', 'medium', 'hard'].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`rounded-2xl px-3 py-1 text-sm capitalize ${
                  filter === type ? 'bg-amber-500/20 text-white' : 'border border-white/10 text-white/60'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-white/40"
        />
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="URL"
          className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-white/40"
        />
        <div className="flex gap-2">
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as any)}
            className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-white"
          >
            <option value="easy">easy</option>
            <option value="medium">medium</option>
            <option value="hard">hard</option>
          </select>
          <button onClick={addProblem} className="primary-btn">
            Add
          </button>
        </div>
      </div>

      <div className="space-y-4 overflow-y-auto max-h-[60vh] pr-2">
        {filteredProblems.map((problem) => (
          <div
            key={problem.id}
            className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 p-4"
          >
            <div className="cursor-pointer" onClick={() => toggleStatus(problem.id)}>
              <h3 className="text-lg font-medium text-white">{problem.title}</h3>
              <div className="mt-1 flex items-center gap-3 text-sm">
                <span className={getDifficultyColor(problem.difficulty)}>{problem.difficulty}</span>
                <span className="text-white/60">{problem.status || 'todo'}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={problem.url}
                target="_blank"
                rel="noopener noreferrer"
                className="ghost-btn h-11 w-11 rounded-2xl"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
              <button onClick={() => removeProblem(problem.id)} className="ghost-btn h-11 w-11 rounded-2xl hover:text-red-400">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}