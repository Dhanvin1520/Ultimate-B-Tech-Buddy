import React, { useState } from 'react';
import { LogIn, User } from 'lucide-react';
import api from '../lib/api';

interface LoginFormProps {
  setIsAuthenticated: (value: boolean) => void;
}

export default function LoginForm({ setIsAuthenticated }: LoginFormProps) {
  const [isGuest, setIsGuest] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
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
        localStorage.removeItem('guest');
        setIsAuthenticated(true);
      } catch (e: any) {
        setServerError('Could not sign up. Try a different email.');
      }
    } else {
      try {
        const loginRes = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', loginRes.data.token);
        localStorage.removeItem('guest');
        setIsAuthenticated(true);
      } catch (e: any) {
        setServerError('Incorrect email or password');
      }
    }
  };

  return (
    <div className="w-full max-w-md relative animate-slide-up">

      <div className="bg-black border-2 border-gray-600 rounded-lg shadow-[0_0_50px_rgba(0,32,255,0.15)] overflow-hidden relative">

 
        <div className="bg-[var(--bg-panel)] p-3 flex items-center justify-between border-b-2 border-gray-600">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <div className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase tracking-widest">
            user@btech-buddy:~/auth
          </div>
          <div className="w-10" /> 
        </div>


        <div className="p-8 relative">

          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />


          <div className="relative z-10 flex flex-col items-center justify-center mb-8">
            <div className="w-16 h-16 bg-black border-2 border-[var(--accent-color)] text-[var(--accent-color)] flex items-center justify-center mb-4 rounded-lg shadow-[0_0_15px_rgba(0,32,255,0.3)]">
              <User className="w-8 h-8" />
            </div>
            <h1 className="heading-lg text-center heading-gamer text-3xl mb-2">SYSTEM ACCESS</h1>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <p className="text-[var(--text-secondary)] font-mono text-xs uppercase tracking-widest">
                Secure Connection Established
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            {!isGuest && (
              <>
                {isSignup && (
                  <div className="group">
                    <label className="text-[10px] font-mono font-bold text-[var(--text-tertiary)] uppercase mb-1 block group-focus-within:text-[var(--accent-color)] transition-colors">
                      Username
                    </label>
                    <input
                      type="text"
                      placeholder="Enter username..."
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-[var(--bg-subtle)] border-2 border-gray-600 text-[var(--text-primary)] px-4 py-3 text-sm font-mono focus:outline-none focus:border-[var(--accent-color)] focus:ring-1 focus:ring-[var(--accent-color)] transition-all placeholder:text-[var(--text-tertiary)] rounded-md"
                    />
                  </div>
                )}
                <div className="group">
                  <label className="text-[10px] font-mono font-bold text-[var(--text-tertiary)] uppercase mb-1 block group-focus-within:text-[var(--accent-color)] transition-colors">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[var(--bg-subtle)] border-2 border-gray-600 text-[var(--text-primary)] px-4 py-3 text-sm font-mono focus:outline-none focus:border-[var(--accent-color)] focus:ring-1 focus:ring-[var(--accent-color)] transition-all placeholder:text-[var(--text-tertiary)] rounded-md"
                  />
                  {errors.email && <p className="text-xs font-bold text-red-500 mt-1 font-mono">! {errors.email}</p>}
                </div>
                <div className="group">
                  <label className="text-[10px] font-mono font-bold text-[var(--text-tertiary)] uppercase mb-1 block group-focus-within:text-[var(--accent-color)] transition-colors">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[var(--bg-subtle)] border-2 border-gray-600 text-[var(--text-primary)] px-4 py-3 text-sm font-mono focus:outline-none focus:border-[var(--accent-color)] focus:ring-1 focus:ring-[var(--accent-color)] transition-all placeholder:text-[var(--text-tertiary)] rounded-md"
                  />
                  {errors.password && <p className="text-xs font-bold text-red-500 mt-1 font-mono">! {errors.password}</p>}
                </div>
              </>
            )}

            <button
              type="submit"
              className="w-full btn-primary py-3 font-mono uppercase tracking-wider flex items-center justify-center gap-2 group overflow-hidden relative"
            >
              <span className="relative z-10 flex items-center gap-2">
                {isGuest ? <User className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                {isGuest ? 'Initialize Guest Mode' : isSignup ? 'Register User' : 'Authenticate'}
              </span>
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </button>

            {serverError && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 text-red-500 text-xs font-mono font-bold text-center">
                [ERROR]: {serverError}
              </div>
            )}

            <div className="flex items-center gap-4 my-6">
              <div className="h-px bg-[var(--border-color)] flex-1" />
              <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest font-mono">OPTIONS</span>
              <div className="h-px bg-[var(--border-color)] flex-1" />
            </div>

            {!isGuest && (
              <button
                type="button"
                onClick={() => setIsGuest(true)}
                className="w-full py-3 text-xs font-mono font-bold text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10 uppercase tracking-wider border border-yellow-500/30 hover:border-yellow-500 transition-all rounded-md mb-4"
              >
                {'>'} Bypass Authentication (Guest Mode)
              </button>
            )}

            {!isGuest && (
              <div className="text-center mt-4 p-3 bg-[var(--bg-subtle)] rounded-md border border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => setIsSignup(!isSignup)}
                  className="text-xs font-mono font-bold text-[var(--accent-color)] hover:text-white transition-colors uppercase tracking-wide"
                >
                  {isSignup ? '<< Return to Login' : '>> Initialize New User Registration'}
                </button>
              </div>
            )}

            {isGuest && (
              <button
                type="button"
                onClick={() => setIsGuest(false)}
                className="w-full py-3 text-xs font-mono font-bold text-[var(--accent-color)] hover:text-white hover:bg-[var(--accent-color)]/10 uppercase tracking-wider border border-[var(--accent-color)]/30 hover:border-[var(--accent-color)] transition-all rounded-md mt-2"
              >
                {'<'} Return to Login Sequence
              </button>
            )}
          </form>
        </div>

        <div className="bg-[var(--bg-panel)] p-2 border-t border-[var(--border-color)] flex justify-between items-center text-[10px] font-mono text-[var(--text-tertiary)]">
          <span>STATUS: ONLINE</span>
          <span>V2.0.4</span>
        </div>
      </div>
    </div>
  );
}