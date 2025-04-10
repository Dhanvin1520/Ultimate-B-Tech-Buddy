import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  isGuest: boolean;
  login: (email: string, password: string) => void;
  loginAsGuest: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isGuest: false,
  login: (email: string, password: string) => {
    // Simple local authentication
    set({ isAuthenticated: true, isGuest: false });
  },
  loginAsGuest: () => {
    set({ isAuthenticated: true, isGuest: true });
  },
  logout: () => {
    set({ isAuthenticated: false, isGuest: false });
  },
}));