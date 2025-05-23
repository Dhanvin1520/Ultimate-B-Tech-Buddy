import {
  Calendar,
  Code2,
  LogOut,
  Music,
  Settings,
  StickyNote,
  FileText,
  Gamepad2,
  MessageSquare,
  Timer as TimerIcon,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  setIsAuthenticated: (value: boolean) => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export default function Sidebar({
  setIsAuthenticated,
  activeSection,
  setActiveSection,
}: SidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { icon: <StickyNote className="w-5 h-5" />, label: 'Notes' },
    { icon: <Calendar className="w-5 h-5" />, label: 'Calendar' },
    { icon: <TimerIcon className="w-5 h-5" />, label: 'Timer' },
    { icon: <Code2 className="w-5 h-5" />, label: 'LeetCode' },
    { icon: <Music className="w-5 h-5" />, label: 'Spotify' },
    { icon: <FileText className="w-5 h-5" />, label: 'Resume' },
    { icon: <Gamepad2 className="w-5 h-5" />, label: 'Games' },
    { icon: <MessageSquare className="w-5 h-5" />, label: 'Chat' },
  ];

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsMobileMenuOpen(false);
  };

  const SidebarContent = ({ showCloseBtn = false }: { showCloseBtn?: boolean }) => (
    <div className="h-full w-64 bg-gray-900 text-white flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600" />
          <span className="font-semibold">BTech Buddy</span>
        </div>
        {showCloseBtn && (
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.label}>
              <button
                onClick={() => {
                  setActiveSection(item.label);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  activeSection === item.label
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
    
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-gray-900 flex items-center justify-between px-4 py-3 shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600" />
          <span className="text-white font-semibold">BTech Buddy</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          className="text-gray-300 hover:text-white"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>


      <div className="hidden md:block w-64 h-screen">
        <SidebarContent />
      </div>


      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-0 left-0 w-64 h-full bg-gray-900 z-50 shadow-lg">
          <SidebarContent showCloseBtn />
        </div>
      )}
    </>
  );
}