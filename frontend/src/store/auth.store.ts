'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      isAuthenticated: false,

      setToken: (token: string) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', token);
        }
        set({ token, isAuthenticated: true });
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
        }
        set({ token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'insurtech-auth',
      partialize: (state) => ({ token: state.token, isAuthenticated: state.isAuthenticated }),
    },
  ),
);
