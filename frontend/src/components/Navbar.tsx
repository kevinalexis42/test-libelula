'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

export function Navbar() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, email, logout } = useAuthStore();

  // Diferimos el render del estado de auth hasta después de la hidratación.
  // Sin esto, el servidor genera HTML con el estado no autenticado y el cliente
  // lo sobreescribe con el autenticado, provocando un error de hidratación en React.
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Show only the local part of the email (before @) to keep the nav compact
  const displayName = email?.split('@')[0] ?? '';

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">L</span>
          </div>
          <span className="font-bold text-gray-900 text-lg">InsurTech</span>
        </a>

        <div className="flex items-center gap-4">
          <a href="/quote" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">
            Nueva Cotización
          </a>

          {mounted && isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-sm text-gray-700">
                <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center">
                  <span className="text-teal-700 font-semibold text-xs uppercase">
                    {displayName.charAt(0)}
                  </span>
                </div>
                <span className="hidden sm:inline">{displayName}</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-red-600 transition-colors"
              >
                Salir
              </button>
            </div>
          ) : (
            <a
              href="/login"
              className="text-sm bg-teal-600 text-white px-3 py-1.5 rounded-lg hover:bg-teal-700 transition-colors"
            >
              Iniciar Sesión
            </a>
          )}
        </div>
      </div>
    </nav>
  );
}
