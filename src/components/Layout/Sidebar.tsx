import {
    BookOpen,
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
    Sun,
    Moon,
  } from 'lucide-react';
  import { useAuthStore } from '../../store/authStore';
  import { useDashboardStore } from '../../store/dashboardStore';
  
  export default function Sidebar() {
    const { logout } = useAuthStore();
    const { activeSection, setActiveSection, darkMode, toggleDarkMode } = useDashboardStore();
  
    const menuItems = [
      { icon: <StickyNote className="w-5 h-5" />, label: 'Notes' },
      { icon: <Calendar className="w-5 h-5" />, label: 'Calendar' },
      { icon: <TimerIcon className="w-5 h-5" />, label: 'Timer' },
      { icon: <Code2 className="w-5 h-5" />, label: 'LeetCode' },
      { icon: <Music className="w-5 h-5" />, label: 'Spotify' },
      { icon: <FileText className="w-5 h-5" />, label: 'Resume' },
      { icon: <Gamepad2 className="w-5 h-5" />, label: 'Games' },
      { icon: <MessageSquare className="w-5 h-5" />, label: 'Chat' },
      { icon: <Settings className="w-5 h-5" />, label: 'Settings' },
    ];
  
    return (
      <aside className="w-64 bg-gray-800 dark:bg-gray-900 min-h-screen flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600" />
            <span className="font-semibold text-white">BTech Buddy</span>
          </div>
          <button
            onClick={toggleDarkMode}
            className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
  
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.label}>
                <button
                  onClick={() => setActiveSection(item.label)}
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
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    );
  }