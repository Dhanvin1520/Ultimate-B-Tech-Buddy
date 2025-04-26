import React, { useState } from 'react';

const quizData = [
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
    options: ['mutable', 'immutable', 'global', 'optional'],
    answer: 'immutable',
  },
  {
    question: 'In a regular JavaScript function (not an arrow function), what does "this" refer to?',
    options: [
      'The object it belongs to',
      'Window object',
      'Depends on how the function is called',
      'Global scope always',
    ],
    answer: 'Depends on how the function is called',
  },
];

const TechQuiz: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [points, setPoints] = useState(0);
  const [quizOver, setQuizOver] = useState(false);
  const [incorrect, setIncorrect] = useState(false);

  const handleChoice = (selected: string) => {
    if (quizData[index]?.answer === selected) {
      setPoints(prev => prev + 1);
      setIncorrect(false);
    } else {
      setIncorrect(true);
    }

    setTimeout(() => {
      if (index + 1 < quizData.length) {
        setIndex(prev => prev + 1);
        setIncorrect(false);
      } else {
        setQuizOver(true);
      }
    }, 800);
  };

  const resetQuiz = () => {
    setIndex(0);
    setPoints(0);
    setQuizOver(false);
    setIncorrect(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-gray-800 rounded-2xl shadow-lg flex flex-col items-center">
      {!quizOver ? (
        <>
          <h1 className="text-cyan-400 text-3xl font-bold mb-6 text-center">Tech Quiz 🎯</h1>

          <div className="text-white text-xl font-semibold mb-6 text-center">
            {quizData[index]?.question}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            {quizData[index]?.options.map((option, i) => (
              <button
                key={i}
                onClick={() => handleChoice(option)}
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300"
              >
                {option}
              </button>
            ))}
          </div>

          {incorrect && (
            <div className="text-red-400 text-lg font-bold mt-4 animate-pulse">
              Incorrect! Try the next one. 💥
            </div>
          )}

          <div className="text-gray-400 text-sm mt-6">
            Question {index + 1} / {quizData.length}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-6">
          <h2 className="text-3xl font-bold text-cyan-400">Quiz Over!</h2>
          <p className="text-xl text-white">Final Score: {points} / {quizData.length}</p>
          <button
            onClick={resetQuiz}
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default TechQuiz;