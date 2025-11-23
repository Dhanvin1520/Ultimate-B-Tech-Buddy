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
  LayoutDashboard,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import SidebarTodo, { SidebarTodoItem } from '../../components/SidebarTodo';
import api from '../../lib/api';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  isMobileMenuOpen?: boolean;
  setIsMobileMenuOpen?: (isOpen: boolean) => void;
  handleLogout?: () => void;
}

type MenuItem = { icon: JSX.Element; label: string };

export default function Sidebar({
  activeSection,
  setActiveSection,
  isMobileMenuOpen = false,
  setIsMobileMenuOpen = () => { },
  handleLogout = () => { }
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [todoPreview, setTodoPreview] = useState<{ id: string; content: string; completed: boolean } | null>(null);
  const [isTodoLoading, setIsTodoLoading] = useState(true);
  const [showTodoPopup, setShowTodoPopup] = useState(false);
  const [todoModalKey, setTodoModalKey] = useState(0);

  const onLogout = () => {
    handleLogout();
    setIsMobileMenuOpen(false);
  };

  const loadTodoPreview = useCallback(async () => {
    if (typeof window === 'undefined') return;
    const guestMode = localStorage.getItem('guest') === 'true';
    setIsTodoLoading(true);

    if (guestMode) {
      const stored = localStorage.getItem('sidebar-todos') || localStorage.getItem('guest-tasks');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length) {
            setTodoPreview({ id: parsed[0].id || parsed[0]._id || 'preview', content: parsed[0].content || parsed[0].title || 'Untitled Task', completed: Boolean(parsed[0].completed) });
          } else {
            setTodoPreview(null);
          }
        } catch {
          setTodoPreview(null);
        }
      } else {
        setTodoPreview(null);
      }
      setIsTodoLoading(false);
      return;
    }

    try {
      const res = await api.get('/tasks');
      if (Array.isArray(res.data) && res.data.length) {
        const first = res.data.find((task: any) => !task.completed) || res.data[0];
        setTodoPreview({ id: String(first._id || first.id || 'preview'), content: first.title || first.content || 'Untitled Task', completed: Boolean(first.completed) });
      } else {
        setTodoPreview(null);
      }
    } catch (error) {
      console.error('Failed to load sidebar task preview:', error);
      setTodoPreview(null);
    } finally {
      setIsTodoLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTodoPreview();
  }, [loadTodoPreview]);

  const handleItemsChange = (items: SidebarTodoItem[]) => {
    if (items.length) {
      const first = items[0];
      setTodoPreview({ id: first.id, content: first.content, completed: first.completed });
    } else {
      setTodoPreview(null);
    }
  };

  const previewText = todoPreview ? todoPreview.content : isTodoLoading ? 'Loading...' : 'No tasks queued';
  const previewTextClass = todoPreview
    ? `text-sm font-semibold truncate ${todoPreview.completed ? 'text-[var(--text-tertiary)] line-through' : 'text-[var(--text-primary)]'}`
    : 'text-sm font-semibold text-[var(--text-tertiary)]';

  const coreItems: MenuItem[] = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Home' },
    { icon: <MessageSquare className="w-5 h-5" />, label: 'Chat' },
    { icon: <Video className="w-5 h-5" />, label: 'Video Chat' },
  ];

  const productivityItems: MenuItem[] = [
    { icon: <Code2 className="w-5 h-5" />, label: 'LeetCode' },
    { icon: <Music className="w-5 h-5" />, label: 'Spotify' },
    { icon: <StickyNote className="w-5 h-5" />, label: 'Notes' },
  ];

  const toolsItems: MenuItem[] = [
    { icon: <TimerIcon className="w-5 h-5" />, label: 'Timer' },
    { icon: <Calendar className="w-5 h-5" />, label: 'Calendar' },
    { icon: <Gamepad2 className="w-5 h-5" />, label: 'Games' },
    { icon: <FileText className="w-5 h-5" />, label: 'Resume' },
  ];

  const renderMenuSection = (title: string, items: MenuItem[], accentClass = 'text-[var(--text-tertiary)]') => (
    <div className="mb-6">
      <div className="px-4 mb-3 flex items-center gap-2">
        {!collapsed ? (
          <>
            <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${accentClass}`}>// {title}</span>
            <div className="flex-1 h-px bg-[var(--border-color)]"></div>
          </>
        ) : (
          <div className="w-full h-px bg-[var(--border-color)]" />
        )}
      </div>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.label}>
            <button
              onClick={() => {
                setActiveSection(item.label);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 rounded-r-lg ${activeSection === item.label
                ? 'border-l-gradient text-[var(--accent-color)] bg-[var(--bg-subtle)]'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]'
                }`}
            >
              <span className={`${activeSection === item.label ? 'text-[var(--accent-color)] icon-pulse-glow' : 'text-[var(--text-secondary)]'}`}>
                {item.icon}
              </span>
              {!collapsed && <span className="font-mono uppercase tracking-tight">{item.label}</span>}
              {!collapsed && activeSection === item.label && (
                <span className="ml-auto text-[10px] font-mono text-[var(--accent-color)] animate-pulse">●</span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

  const SidebarContent = ({ showCloseBtn = false }: { showCloseBtn?: boolean }) => (
    <div className={`${collapsed ? 'w-20' : 'w-72'} min-h-0 h-full bg-[var(--bg-panel)] text-[var(--text-primary)] flex flex-col border-r border-[var(--border-color)] transition-[width] duration-200 relative overflow-hidden`}>
      {/* Tech Decorations */}
      <div className="absolute top-0 left-0 w-full h-1 bg-[var(--accent-color)] opacity-50"></div>
      <div className="absolute bottom-0 right-0 w-2 h-2 bg-[var(--accent-color)]"></div>

      <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} p-6 border-b border-[var(--border-color)] relative`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center bg-black text-white font-bold text-xl rounded-none tech-border">
            <span className="font-mono">B</span>
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-none tracking-tight font-mono">B_BUDDY</span>
              <span className="text-[10px] font-bold text-[var(--accent-color)] uppercase tracking-widest mt-1 font-mono">SYS.ONLINE_v2.0</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {showCloseBtn ? (
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={() => setCollapsed((c) => !c)}
              className="hidden md:inline-flex p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <nav className="flex-1 p-4 overflow-y-auto min-h-0 custom-scrollbar">
          {renderMenuSection('Core', coreItems, 'text-[var(--accent-color)]')}
          {renderMenuSection('Productivity', productivityItems)}
          {renderMenuSection('Tools', toolsItems)}
        </nav>

        <div className="p-4 border-t border-[var(--border-color)] space-y-4 bg-[var(--bg-subtle)]/40">
          <div className={`rounded-lg border border-[var(--border-color)] bg-[var(--bg-panel)]/70 ${collapsed ? 'p-3' : 'p-4'}`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-[var(--text-tertiary)]">Next Task</p>
                <p className={previewTextClass}>{previewText}</p>
                {todoPreview && !todoPreview.completed && (
                  <span className="mt-1 inline-flex items-center text-[10px] font-mono uppercase tracking-widest text-[var(--accent-color)]">• Active</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  loadTodoPreview();
                  setTodoModalKey((prev) => prev + 1);
                  setShowTodoPopup(true);
                }}
                className={`${collapsed ? 'p-2' : 'px-3 py-2'} rounded-md border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--accent-color)] hover:border-[var(--accent-color)] transition-colors`}
              >
                {collapsed ? '+' : 'Open'}
              </button>
            </div>
          </div>

          <div className="px-2 flex justify-between text-[10px] font-mono text-[var(--text-tertiary)]">
            <span>CPU: 12%</span>
            <span>MEM: 450MB</span>
          </div>

          <button
            onClick={onLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition-all ${collapsed ? 'justify-center' : ''}`}
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span className="font-mono uppercase tracking-wide">Logout</span>}
          </button>
        </div>

        {showTodoPopup && (
          <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowTodoPopup(false)} />
            <div className="relative w-[calc(100%-2rem)] max-w-lg mb-6 md:mb-0 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-panel)] shadow-2xl">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)]">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-[var(--text-tertiary)]">Tasks Module</p>
                  <h3 className="text-base font-semibold text-[var(--text-primary)]">Quick Queue</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTodoPopup(false)}
                  className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4">
                <SidebarTodo
                  key={todoModalKey}
                  initialOpen
                  onItemsChange={handleItemsChange}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>

      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[var(--bg-panel)] flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center bg-black text-white font-bold text-lg rounded-none">B</div>
          <span className="font-bold text-lg">BTech Buddy</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-[var(--text-primary)] p-2"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

  
      <div className="hidden md:block h-screen sticky top-0 z-40">
        <SidebarContent />
      </div>


      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="relative h-full">
            <SidebarContent showCloseBtn />
          </div>
        </div>
      )}
    </>
  );
}