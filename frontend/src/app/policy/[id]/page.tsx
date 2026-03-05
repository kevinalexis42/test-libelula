'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getPolicy } from '@/lib/api';
import { ApiError, Policy } from '@/types';
import { useAuthStore } from '@/store/auth.store';
import { ErrorBanner } from '@/components/ErrorBanner';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface PolicyDetailPageProps {
  params: { id: string };
}

const INSURANCE_LABELS: Record<string, string> = {
  AUTO: 'Seguro de Auto',
  SALUD: 'Seguro de Salud',
  HOGAR: 'Seguro de Hogar',
};

const COVERAGE_LABELS: Record<string, string> = {
  BASICA: 'Cobertura Básica',
  ESTANDAR: 'Cobertura Estándar',
  PREMIUM: 'Cobertura Premium',
};

export default function PolicyDetailPage({ params }: PolicyDetailPageProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const [policy, setPolicy] = useState<Policy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Protect route: redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/policy/${params.id}`);
    }
  }, [isAuthenticated, params.id, router]);

  const loadPolicy = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPolicy(params.id);
      setPolicy(data);
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 401) {
        router.push(`/login?redirect=/policy/${params.id}`);
        return;
      }
      setError(err instanceof ApiError ? err.problem.detail : 'Error al cargar la póliza.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadPolicy();
    }
  }, [params.id, isAuthenticated]);

  if (!isAuthenticated) {
    return <LoadingSpinner message="Redirigiendo a inicio de sesión..." />;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/quote"
          className="text-sm text-gray-500 hover:text-teal-600 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 rounded"
        >
          ← Nueva cotización
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Detalle de Póliza</h1>
        <p className="text-gray-500 mt-2">Información de tu póliza de seguro emitida.</p>
      </div>

      {loading && <LoadingSpinner message="Cargando póliza..." />}

      {error && !loading && (
        <ErrorBanner message={error} onRetry={loadPolicy} />
      )}

      {policy && !loading && (
        <div className="space-y-6">
          {/* Policy header */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Póliza Activa</h2>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                {policy.status === 'ACTIVE' ? 'Activa' : 'Cancelada'}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">ID de Póliza</p>
                <p className="font-mono text-sm font-medium text-gray-900">{policy.id}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">ID de Cotización</p>
                <p className="font-mono text-sm text-gray-600">{policy.quoteId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Fecha de emisión</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(policy.issuedAt).toLocaleString('es-EC', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Coverage details from quote */}
          {policy.quote && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Detalles de Cobertura</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-0.5">Tipo de seguro</p>
                  <p className="font-semibold text-gray-900">
                    {INSURANCE_LABELS[policy.quote.insuranceType] || policy.quote.insuranceType}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-0.5">Cobertura</p>
                  <p className="font-semibold text-gray-900">
                    {COVERAGE_LABELS[policy.quote.coverage] || policy.quote.coverage}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-0.5">Edad asegurada</p>
                  <p className="font-semibold text-gray-900">{policy.quote.age} años</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-0.5">Ubicación</p>
                  <p className="font-semibold text-gray-900">{policy.quote.location}</p>
                </div>
              </div>

              <div className="mt-4 bg-teal-50 border border-teal-200 rounded-xl p-4 text-center">
                <p className="text-sm text-teal-600 font-medium mb-1">Prima mensual</p>
                <p className="text-3xl font-bold text-teal-700">
                  ${policy.quote.estimatedPremium.toFixed(2)}
                </p>
                <p className="text-xs text-teal-500 mt-1">USD / mes</p>
              </div>
            </div>
          )}

          <div className="text-center">
            <Link
              href="/quote"
              className="btn-secondary inline-block px-6 py-3"
            >
              Solicitar Nueva Cotización
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
