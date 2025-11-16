import {
  Calendar,
  Code2,
  LogOut,
  Music,
  StickyNote,
  FileText,
  Gamepad2,
  MessageSquare,
  Timer as TimerIcon,
  Menu,
  X,
  Video,
} from 'lucide-react';
import { useState } from 'react';
import SidebarTodo from '../../components/SidebarTodo';

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
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { icon: <MessageSquare className="w-5 h-5" />, label: 'Chat' },
    { icon: <Video className="w-5 h-5" />, label: 'Video Chat' },
    { icon: <StickyNote className="w-5 h-5" />, label: 'Home' },
    { icon: <StickyNote className="w-5 h-5" />, label: 'Notes' },
    { icon: <Calendar className="w-5 h-5" />, label: 'Calendar' },
    { icon: <TimerIcon className="w-5 h-5" />, label: 'Timer' },
    { icon: <Code2 className="w-5 h-5" />, label: 'LeetCode' },
    { icon: <Music className="w-5 h-5" />, label: 'Spotify' },
    { icon: <FileText className="w-5 h-5" />, label: 'Resume' },
    { icon: <Gamepad2 className="w-5 h-5" />, label: 'Games' },
  ];

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsMobileMenuOpen(false);
  };

  const SidebarContent = ({ showCloseBtn = false }: { showCloseBtn?: boolean }) => (
    <div className={`${collapsed ? 'w-20' : 'w-64'} h-full bg-slate-900/60 backdrop-blur-xl text-slate-200 flex flex-col border-r border-slate-800 transition-[width] duration-200`}>
      <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} p-4 border-b border-slate-800`}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600" />
          {!collapsed && <span className="font-semibold text-slate-100">BTech Buddy</span>}
        </div>
        {showCloseBtn ? (
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="hidden md:inline-flex p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
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
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {item.icon}
                {!collapsed && <span className="font-medium">{item.label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {!collapsed && <SidebarTodo />}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 bg-slate-800 text-white hover:bg-slate-700 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
    
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl flex items-center justify-between px-4 py-3 shadow-md border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600" />
          <span className="text-slate-100 font-semibold">BTech Buddy</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          className="text-slate-300 hover:text-white"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>


      <div className="hidden md:block h-screen">
        <SidebarContent />
      </div>


      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-0 left-0 w-64 h-full bg-slate-900/80 backdrop-blur-xl z-50 shadow-lg border-r border-slate-800">
          <SidebarContent showCloseBtn />
        </div>
      )}
    </>
  );
}