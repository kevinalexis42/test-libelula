'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  email: string | null;
  isAuthenticated: boolean;
  setAuth: (token: string, email: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      email: null,
      isAuthenticated: false,

      setAuth: (token: string, email: string) => {
        set({ token, email, isAuthenticated: true });
      },

      logout: () => {
        set({ token: null, email: null, isAuthenticated: false });
      },
    }),
    {
      // Clave de localStorage donde Zustand guarda el estado entre recargas.
      name: 'insurtech-auth',
      // Solo persistimos los datos. Las acciones las recrea el store en cada
      // carga y no tiene sentido serializarlas.
      partialize: (state) => ({
        token: state.token,
        email: state.email,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
