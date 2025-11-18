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
        return <Home setActiveSection={handleSetActiveSection} />;
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
    <div className="h-screen">
      <div className="flex h-screen">
        <Sidebar
          setIsAuthenticated={setIsAuthenticated}
          activeSection={activeSection}
          setActiveSection={handleSetActiveSection}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 p-6 sm:p-8 bg-slate-900 overflow-auto">
            {renderSection()}
          </main>
        </div>
        <Chatbot />
      </div>
    </div>
  );
}