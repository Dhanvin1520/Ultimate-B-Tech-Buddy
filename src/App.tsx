
import Background from './components/Background';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Layout/Dashboard';
import { useAuthStore } from './store/authStore';

function App() {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Background />
        <div className="min-h-screen flex items-center justify-center p-4">
          <LoginForm />
        </div>
      </div>
    );
  }

  return <Dashboard />;
}

export default App;