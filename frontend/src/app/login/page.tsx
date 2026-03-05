'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { login } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { ApiError } from '@/types';

const loginSchema = z.object({
  email: z.string().email('Ingrese un email válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setToken } = useAuthStore();
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setGlobalError(null);
    setLoading(true);
    try {
      const response = await login(data);
      setToken(response.accessToken);
      router.push('/quote');
    } catch (error) {
      if (error instanceof ApiError) {
        setGlobalError(error.problem.detail);
      } else {
        setGlobalError('Error al conectar con el servidor. Intente de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Iniciar Sesión</h1>
          <p className="text-gray-500 mt-2">Accede para emitir y consultar tus pólizas</p>
        </div>

        <div className="card">
          {/* Global error banner */}
          {globalError && (
            <div
              role="alert"
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
            >
              {globalError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate aria-label="Formulario de inicio de sesión">
            {/* Email */}
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className={`input-field ${errors.email ? 'input-error' : ''}`}
                placeholder="user@example.com"
                aria-describedby={errors.email ? 'email-error' : undefined}
                aria-invalid={!!errors.email}
                {...register('email')}
              />
              {errors.email && (
                <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                className={`input-field ${errors.password ? 'input-error' : ''}`}
                placeholder="••••••••"
                aria-describedby={errors.password ? 'password-error' : undefined}
                aria-invalid={!!errors.password}
                {...register('password')}
              />
              {errors.password && (
                <p id="password-error" className="mt-1 text-sm text-red-600" role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3"
              aria-busy={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Ingresando...
                </span>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
            <p className="font-medium mb-1">Credenciales de prueba:</p>
            <p>Email: user@example.com</p>
            <p>Contraseña: Password123!</p>
          </div>

          <p className="mt-4 text-center text-sm text-gray-500">
            ¿Solo quieres cotizar?{' '}
            <a
              href="/quote"
              className="text-teal-600 font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-teal-500 rounded"
            >
              Obtén una cotización sin iniciar sesión
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
