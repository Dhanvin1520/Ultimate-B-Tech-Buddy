import { useState } from 'react';
import { GraduationCap, LogIn, User } from 'lucide-react';

interface LoginFormProps {
  setIsAuthenticated: (value: boolean) => void;
}

export default function LoginForm({ setIsAuthenticated }: LoginFormProps) {
  const [isGuest, setIsGuest] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isGuest) {
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


    setIsAuthenticated(true);
  };

  return (
    <div className="w-full max-w-md p-8 bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl">
      <div className="flex items-center justify-center mb-8">
        <GraduationCap className="w-12 h-12 text-blue-500" />
        <h1 className="text-3xl font-bold ml-3 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          BTech Buddy
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {!isGuest && (
          <>
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-gray-200/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-white"
              />
              {errors.email && <p className="text-sm text-red-400 mt-1">{errors.email}</p>}
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-gray-200/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-white"
              />
              {errors.password && <p className="text-sm text-red-400 mt-1">{errors.password}</p>}
            </div>
          </>
        )}

        <button
          type="submit"
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          {isGuest ? <User className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
          {isGuest ? 'Continue as Guest' : 'Login'}
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setIsGuest(!isGuest);
              setErrors({ email: '', password: '' });
            }}
            className="text-blue-400 hover:text-blue-500 text-sm"
          >
            {isGuest ? 'Have an account? Login' : 'Continue as Guest'}
          </button>
        </div>
      </form>
    </div>
  );
}