import {
    BookOpen,
    Calendar,
    Code2,
    LogOut,
    Music,
    Settings,
    StickyNote,
    Sun,
  } from 'lucide-react';
  import { useAuthStore } from '../../store/authStore';
  import { useDashboardStore } from '../../store/dashboardStore';
  
  export default function Sidebar() {
    const { logout } = useAuthStore();
    const { activeSection, setActiveSection } = useDashboardStore();
  
    const menuItems = [
      { icon: <StickyNote className="w-5 h-5" />, label: 'Notes' },
      { icon: <Calendar className="w-5 h-5" />, label: 'Calendar' },
      { icon: <Code2 className="w-5 h-5" />, label: 'LeetCode' },
      { icon: <BookOpen className="w-5 h-5" />, label: 'CodeForces' },
      { icon: <Music className="w-5 h-5" />, label: 'Spotify' },
      { icon: <Sun className="w-5 h-5" />, label: 'Weather' },
      { icon: <Settings className="w-5 h-5" />, label: 'Settings' },
    ];
  
    return (
      <div className="w-64 bg-gray-800 h-screen p-4 flex flex-col">
        <div className="flex items-center gap-2 px-2 py-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600" />
          <span className="font-semibold text-white">BTech Buddy</span>
        </div>
  
        <nav className="flex-1 mt-8">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.label}>
                <button
                  onClick={() => setActiveSection(item.label)}
                  className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-colors ${
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
  
        <button
          onClick={logout}
          className="flex items-center gap-3 px-2 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors mt-auto"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    );
  }