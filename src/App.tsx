import { useState } from 'react';
import Background from './components/Background';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Layout/Dashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem('token');
    const guest = localStorage.getItem('guest') === 'true';
    return Boolean(token) || guest;
  });

  const handleSetIsAuthenticated = (value: boolean) => {
    setIsAuthenticated(value);
    if (!value) {
      localStorage.removeItem('token');
      localStorage.removeItem('guest');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Background />
        <div className="min-h-screen flex items-center justify-center p-4">
          <LoginForm setIsAuthenticated={handleSetIsAuthenticated} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Dashboard setIsAuthenticated={handleSetIsAuthenticated} />
    </div>
  );
}

export default App;