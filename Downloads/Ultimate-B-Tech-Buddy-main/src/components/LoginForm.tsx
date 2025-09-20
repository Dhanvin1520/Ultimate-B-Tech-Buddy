import { useState } from 'react';
import { GraduationCap, LogIn, User } from 'lucide-react';
import api from '../lib/api';

interface LoginFormProps {
  setIsAuthenticated: (value: boolean) => void;
}

export default function LoginForm({ setIsAuthenticated }: LoginFormProps) {
  const [isGuest, setIsGuest] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [serverError, setServerError] = useState('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError('');
    if (isGuest) {
      localStorage.setItem('guest', 'true');
      setIsAuthenticated(true);
      return;
    }

    let hasError = false;
    const newErrors = { email: '', password: '' };

    if (!validateEmail(email)) {
      newErrors.email = 'Invalid email format.';
      hasError = true;
    }

    if (password.trim().length === 0) {
      newErrors.password = 'Password cannot be empty.';
      hasError = true;
    }

    setErrors(newErrors);

    if (hasError) return;
    if (isSignup) {
      try {
        const uname = username || email.split('@')[0];
        await api.post('/auth/register', { username: uname, email, password });
        const loginRes = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', loginRes.data.token);
        setIsAuthenticated(true);
      } catch (e: any) {
        setServerError('Could not sign up. Try a different email.');
      }
    } else {
      try {
        const loginRes = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', loginRes.data.token);
        setIsAuthenticated(true);
      } catch (e: any) {
        setServerError('Incorrect email or password');
      }
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white/60 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200">
      <div className="flex items-center justify-center mb-8">
        <GraduationCap className="w-12 h-12 text-slate-900" />
        <h1 className="text-3xl font-bold ml-3 text-slate-900">
          BTech Buddy
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {!isGuest && (
          <>
            {isSignup && (
              <div>
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-600 focus:outline-none text-slate-900 placeholder-slate-400"
                />
              </div>
            )}
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-600 focus:outline-none text-slate-900 placeholder-slate-400"
              />
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-600 focus:outline-none text-slate-900 placeholder-slate-400"
              />
              {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
            </div>
          </>
        )}

        <button
          type="submit"
          className="w-full py-3 px-4 bg-slate-900 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
        >
          {isGuest ? <User className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
          {isGuest ? 'Continue as Guest' : isSignup ? 'Sign up' : 'Login'}
        </button>

        {serverError && (
          <div className="text-center text-red-600 text-sm">{serverError}</div>
        )}

        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setIsGuest(!isGuest);
              setErrors({ email: '', password: '' });
            }}
            className="text-slate-700 hover:text-slate-900 text-sm"
          >
            {isGuest ? 'Have an account? Login' : 'Continue as Guest'}
          </button>
        </div>
        {!isGuest && (
          <div className="text-center mt-2">
            <button
              type="button"
              onClick={() => setIsSignup((v) => !v)}
              className="text-slate-700 hover:text-slate-900 text-sm"
            >
              {isSignup ? 'Already have an account? Login' : "Don't have an account? Sign up"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}