import { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import Home from '../Features/Home';
import Chatbot from '../Features/Chatbot';

import Chat from '../Features/Chat';
import VideoChat from '../Features/VideoChat';
import Notes from '../Features/Notes';
import Calendar from '../Features/Calendar';
import Timer from '../Features/Timer';
import LeetCode from '../Features/LeetCode';
import Spotify from '../Features/Spotify';
import Resume from '../Features/Resume';
import Games from '../Features/Games';

interface DashboardProps {
  setIsAuthenticated: (value: boolean) => void;
}

export default function Dashboard({ setIsAuthenticated }: DashboardProps) {
  const [activeSection, setActiveSection] = useState(() => {
    return localStorage.getItem('activeSection') || 'Home';
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSetActiveSection = (section: string) => {
    setActiveSection(section);
    localStorage.setItem('activeSection', section);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'Home':
        return <Home setActiveSection={handleSetActiveSection} />;
      case 'Chat':
        return <Chat key="chat" />;
      case 'Notes':
        return <Notes />;
      case 'Calendar':
        return <Calendar />;
      case 'Timer':
        return <Timer />;
      case 'LeetCode':
        return <LeetCode />;
      case 'Spotify':
        return <Spotify />;
      case 'Resume':
        return <Resume />;
      case 'Games':
        return <Games />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-fade-in">
            <h2 className="heading-lg mb-4">Coming Soon</h2>
            <p className="text-[var(--text-secondary)] max-w-md">
              The <strong>{activeSection}</strong> module is currently being refactored to the new design system. Check back shortly.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-page)]">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={handleSetActiveSection}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        handleLogout={() => setIsAuthenticated(false)}
      />

      <main className="flex-1 overflow-y-auto relative w-full">
        <div className="md:hidden p-4 flex items-center justify-between border-b border-[var(--border-color)] bg-[var(--bg-panel)] sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-black text-white flex items-center justify-center font-bold text-xs">B</div>
            <span className="font-bold text-lg">BTech Buddy</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 md:p-12 max-w-7xl mx-auto">
          {activeSection !== 'Video Chat' && renderSection()}
          <VideoChat 
            key="videochat" 
            isActive={activeSection === 'Video Chat'} 
            onExpand={() => handleSetActiveSection('Video Chat')} 
          />
        </div>
      </main>

      <Chatbot />
    </div>
  );
}