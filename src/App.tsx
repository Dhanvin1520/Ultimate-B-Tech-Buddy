import { useEffect, useState } from 'react';
import { Loader2, Wifi } from 'lucide-react';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Layout/Dashboard';
import Swiss3DBackground from './components/Swiss3DBackground';
import api from './lib/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem('token');
    const guest = localStorage.getItem('guest');


    return Boolean(token) || guest === 'true';
  });
  const [isServerWakingUp, setIsServerWakingUp] = useState(false);

  useEffect(() => {

    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');

    const handleUnauthorized = () => {
      handleSetIsAuthenticated(false);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);

    // Wake up server
    const wakeUpServer = async () => {
      const timeout = setTimeout(() => {
        setIsServerWakingUp(true);
      }, 1500);

      try {
        await api.get('/health');
      } catch (err) {
        // Ignore error, just trying to wake it up
      } finally {
        clearTimeout(timeout);
        setIsServerWakingUp(false);
      }
    };

    wakeUpServer();

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const handleSetIsAuthenticated = (value: boolean) => {
    setIsAuthenticated(value);
    if (!value) {
      localStorage.removeItem('token');
      localStorage.removeItem('guest');
      localStorage.removeItem('activeSection');
      localStorage.removeItem('chat_name');

    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] font-sans selection:bg-[var(--accent-color)] selection:text-white relative overflow-hidden">
      <Swiss3DBackground />

      {/* Server Wake-up Banner */}
      {isServerWakingUp && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-blue-600 text-white py-2 px-4 flex items-center justify-center gap-3 shadow-lg animate-slide-down">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm font-bold font-mono uppercase tracking-wide">
            Waking up server... (This may take a moment)
          </span>
          <Wifi className="w-4 h-4 opacity-50" />
        </div>
      )}

      {isAuthenticated ? (
        <Dashboard setIsAuthenticated={handleSetIsAuthenticated} />
      ) : (
        <div className="flex items-center justify-center min-h-screen p-4">
          <LoginForm setIsAuthenticated={handleSetIsAuthenticated} />
        </div>
      )}
    </div>
  );
}

export default App;