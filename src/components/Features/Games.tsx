import { RotateCcw, Sparkles } from 'lucide-react';
import { useState } from 'react';

type QuizQuestion = {
  question: string;
  options: string[];
  answer: string;
};

const quizData: QuizQuestion[] = [
  {
    question: 'What is the output of `typeof NaN` in JavaScript?',
    options: ['undefined', 'number', 'NaN', 'object'],
    answer: 'number',
  },
  {
    question: 'Which React hook is used for handling side effects?',
    options: ['useState', 'useEffect', 'useContext', 'useMemo'],
    answer: 'useEffect',
  },
  {
    question: 'What is the time complexity of accessing an array element?',
    options: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'],
    answer: 'O(1)',
  },
  {
    question: 'Which keyword is used to declare a constant variable?',
    options: ['var', 'let', 'const', 'constant'],
    answer: 'const',
  },
  {
    question: 'In React, props are _____.',
    options: ['mutable', 'functions', 'immutable', 'state'],
    answer: 'immutable',
  },
  {
    question: 'In a regular function, what does `this` refer to by default?',
    options: ['Window object', 'The function itself', 'Depends on how it is called', 'Undefined'],
    answer: 'Depends on how it is called',
  },
];

const optionClasses = (
  option: string,
  selected: string | null,
  feedback: 'correct' | 'incorrect' | null,
  answer: string,
) => {
  const base =
    'rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-left text-lg font-semibold text-white/80 transition-all duration-300 hover:border-amber-300/60 hover:bg-amber-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 disabled:cursor-not-allowed';

  if (!selected) return base;

  if (option === selected && feedback === 'correct')
    return `${base} border-emerald-400/60 bg-emerald-500/10 text-white shadow-[0_0_25px_rgba(16,185,129,0.25)]`;

  if (option === selected && feedback === 'incorrect')
    return `${base} border-rose-400/60 bg-rose-500/10 text-white shadow-[0_0_25px_rgba(251,113,133,0.25)]`;

  if (feedback === 'incorrect' && option === answer)
    return `${base} border-emerald-400/30 bg-emerald-500/5 text-white`;

  return `${base} opacity-50`;
};

export default function TechQuiz() {
  const [index, setIndex] = useState(0);
  const [points, setPoints] = useState(0);
  const [quizOver, setQuizOver] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

  const totalQuestions = quizData.length;
  const currentQuestion = quizData[index];
  const progress = quizOver ? 100 : (index / totalQuestions) * 100;

  const handleChoice = (option: string) => {
    if (quizOver || feedback) return;
    setSelectedOption(option);
    const isCorrect = currentQuestion?.answer === option;

    if (isCorrect) {
      setPoints((prev) => prev + 1);
      setFeedback('correct');
    } else {
      setFeedback('incorrect');
    }

    setTimeout(() => {
      if (index + 1 < totalQuestions) {
        setIndex((prev) => prev + 1);
        setSelectedOption(null);
        setFeedback(null);
      } else {
        setQuizOver(true);
      }
    }, 900);
  };

  const resetQuiz = () => {
    setIndex(0);
    setPoints(0);
    setQuizOver(false);
    setSelectedOption(null);
    setFeedback(null);
  };

  return (
    <div className="glass-panel border-white/10 p-6 text-white">
      <div className="flex flex-col gap-2 text-center">
        <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-white/50">
          <Sparkles className="h-4 w-4 text-amber-300" />
          Quiz Mode
        </div>
        <h1 className="panel-title text-3xl">Tech Quiz 🎯</h1>
        <p className="text-sm text-white/50">
          Quick-fire fundamentals to keep your brain warmed up.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/5 bg-white/5 px-5 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">Score</p>
          <p className="text-3xl font-semibold text-white">{points}</p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">Progress</p>
          <p className="text-3xl font-semibold text-white">
            {quizOver ? totalQuestions : index + 1}
            <span className="text-white/40"> / {totalQuestions}</span>
          </p>
        </div>
      </div>

      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {!quizOver ? (
        <div className="mt-6 space-y-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">Question</p>
            <p className="mt-3 text-2xl font-semibold leading-snug text-white">
              {currentQuestion?.question}
            </p>
          </div>

          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
            {currentQuestion?.options.map((option) => (
              <button
                key={option}
                onClick={() => handleChoice(option)}
                disabled={!!feedback}
                className={optionClasses(option, selectedOption, feedback, currentQuestion.answer)}
              >
                {option}
              </button>
            ))}
          </div>

          {feedback === 'correct' && (
            <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-center text-sm font-semibold text-emerald-200">
              Nailed it! Keep going.
            </div>
          )}

          {feedback === 'incorrect' && (
            <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-center text-sm font-semibold text-rose-200">
              Missed that one — watch for the right concept!
            </div>
          )}
        </div>
      ) : (
        <div className="mt-8 space-y-6 text-center">
          <h2 className="panel-title text-3xl">Quiz Over!</h2>
          <p className="text-lg text-white/70">
            You scored <span className="text-white">{points}</span> out of {totalQuestions}.
          </p>
          <button onClick={resetQuiz} className="primary-btn inline-flex items-center gap-2 px-8 py-3">
            <RotateCcw className="h-5 w-5" />
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}