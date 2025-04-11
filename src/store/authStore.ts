import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  isGuest: boolean;
  error: string | null;
  login: (email: string, password: string) => void;
  loginAsGuest: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isGuest: false,
  error: null,

  login: (email: string, password: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      set({ error: 'Invalid email format.' });
      return;
    }

    if (password.trim().length === 0) {
      set({ error: 'Password cannot be empty.' });
      return;
    }

    // If valid
    set({ isAuthenticated: true, isGuest: false, error: null });
  },

  loginAsGuest: () => {
    set({ isAuthenticated: true, isGuest: true, error: null });
  },

  logout: () => {
    set({ isAuthenticated: false, isGuest: false, error: null });
  },
}));