import React, { useState } from 'react';
import Background from './components/Background';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Layout/Dashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  const handleSetIsAuthenticated = (value: boolean) => {
    setIsAuthenticated(value);
    localStorage.setItem('isAuthenticated', value.toString());
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Background />
        <div className="min-h-screen flex items-center justify-center p-4">
          <LoginForm setIsAuthenticated={handleSetIsAuthenticated} />
        </div>
      </div>
    );
  }

  return <Dashboard setIsAuthenticated={handleSetIsAuthenticated} />;
}

export default App;