import { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';

interface Problem {
  id: number;
  title: string;
  difficulty: string;
  url: string;
}

const SAMPLE_PROBLEMS: Problem[] = [
  {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    url: "https://leetcode.com/problems/two-sum/"
  },
  {
    id: 2,
    title: "Add Two Numbers",
    difficulty: "Medium",
    url: "https://leetcode.com/problems/add-two-numbers/"
  },
  {
    id: 3,
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/"
  },
  {
    id: 4,
    title: "Median of Two Sorted Arrays",
    difficulty: "Hard",
    url: "https://leetcode.com/problems/median-of-two-sorted-arrays/"
  }
];

export default function LeetCode() {
  const [problems, setProblems] = useState<Problem[]>(SAMPLE_PROBLEMS);
  const [filter, setFilter] = useState<string>('all');

  const filteredProblems = problems.filter(problem => 
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
    <div className="bg-gray-800 p-6 rounded-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">LeetCode Problems</h2>
        <div className="flex gap-2">
          {['all', 'easy', 'medium', 'hard'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1 rounded-lg capitalize ${
                filter === type
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredProblems.map((problem) => (
          <div
            key={problem.id}
            className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <div>
              <h3 className="text-white font-medium">{problem.title}</h3>
              <span className={`text-sm ${getDifficultyColor(problem.difficulty)}`}>
                {problem.difficulty}
              </span>
            </div>
            <a
              href={problem.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}