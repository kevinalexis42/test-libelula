'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createQuote } from '@/lib/api';
import { ApiError, Quote, InsuranceType } from '@/types';
import { QuoteForm, QuoteFormData } from '@/components/QuoteForm';
import { ErrorBanner } from '@/components/ErrorBanner';
import { LoadingSpinner } from '@/components/LoadingSpinner';

function QuotePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultInsuranceType = searchParams.get('insuranceType') as InsuranceType | null;

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: QuoteFormData) => {
    setError(null);
    setIsLoading(true);
    try {
      const quote: Quote = await createQuote(data);
      router.push(`/quote/${quote.id}`);
    } catch (err) {
      if (err instanceof ApiError) {
        if (Array.isArray(err.problem.errors)) {
          setError(err.problem.errors.join('. '));
        } else {
          setError(err.problem.detail);
        }
      } else {
        setError('Error al procesar la cotización. Intente de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Nueva Cotización</h1>
        <p className="text-gray-500 mt-2">
          Complete los datos para obtener su prima estimada con desglose detallado.
        </p>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorBanner message={error} onDismiss={() => setError(null)} />
        </div>
      )}

      <div className="card">
        <QuoteForm
          defaultInsuranceType={defaultInsuranceType || undefined}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

export default function QuotePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <QuotePageContent />
    </Suspense>
  );
}
