import { useState } from 'react';
import Sidebar from './Sidebar';
import Notes from '../Features/Notes';
import Calendar from '../Features/Calendar';
import Tasks from '../Features/Tasks';
import LeetCode from '../Features/LeetCode';
import Timer from '../Features/Timer';
import Chat from '../Features/Chat';
import Spotify from '../Features/Spotify';
import Resume from '../Features/Resume';
import Chatbot from '../Features/Chatbot';
import BTechBuddyQuizGame from '../Features/Games';
import Home from '../Features/Home';
import VideoChat from '../Features/VideoChat';

interface DashboardProps {
  setIsAuthenticated: (value: boolean) => void;
}

export default function Dashboard({ setIsAuthenticated }: DashboardProps) {
  const [activeSection, setActiveSection] = useState(() => {
    return localStorage.getItem('activeSection') || 'Chat';
  });

  const handleSetActiveSection = (section: string) => {
    setActiveSection(section);
    localStorage.setItem('activeSection', section);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'Home':
        return <Home />;
      case 'Notes':
        return <Notes />;
      case 'Calendar':
        return <Calendar />;
      case 'Tasks':
        return <Tasks />;
      case 'Timer':
        return <Timer />;
      case 'LeetCode':
        return <LeetCode />;
      case 'Spotify':
        return <Spotify />;
      case 'Resume':
        return <Resume />;
      case 'Chat':
        return <Chat />;
      case 'Video Chat':
        return <VideoChat />;
      case 'Games':
        return (
          <div className="bg-gray-800 p-6 rounded-xl flex justify-center items-center h-full">
            <BTechBuddyQuizGame/>
          </div>
        );
      default:
        return (
          <div className="bg-white/70 backdrop-blur-xl p-6 rounded-xl border border-slate-200">
            <h2 className="text-xl font-semibold mb-4 text-slate-900">{activeSection}</h2>
            <p className="text-slate-600">Coming soon...</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen">
      <div className="flex min-h-screen">
        <Sidebar
          setIsAuthenticated={setIsAuthenticated}
          activeSection={activeSection}
          setActiveSection={handleSetActiveSection}
        />
        <div className="flex-1 flex flex-col">
          <header className="relative h-16 border-b border-slate-800 bg-slate-900/60 backdrop-blur-xl px-6 flex items-center justify-between overflow-hidden">
            {/* soft glass accents */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-16 -left-24 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl" />
              <div className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl" />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 animate-pulse" />
              <div className="hidden sm:block">
                <div className="text-xs text-slate-400 uppercase tracking-wide">BTech Buddy</div>
                <div className="text-sm text-slate-200">Simple • Clean • Cool</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Section</span>
              <span className="px-2 py-1 rounded-md bg-slate-800/70 backdrop-blur-md border border-slate-700 text-slate-200 text-sm shadow-sm">{activeSection}</span>
            </div>
          </header>
          <main className="flex-1 p-6 sm:p-8 bg-slate-900">
            {renderSection()}
          </main>
        </div>
        <Chatbot />
      </div>
    </div>
  );
}