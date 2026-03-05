'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getQuote, createPolicy } from '@/lib/api';
import { ApiError, Policy, Quote } from '@/types';
import { useAuthStore } from '@/store/auth.store';
import { QuoteResult } from '@/components/QuoteResult';
import { ErrorBanner } from '@/components/ErrorBanner';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface QuoteDetailPageProps {
  params: { id: string };
}

export default function QuoteDetailPage({ params }: QuoteDetailPageProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const [quote, setQuote] = useState<Quote | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(true);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  const [emitting, setEmitting] = useState(false);
  const [emitError, setEmitError] = useState<string | null>(null);
  const [policy, setPolicy] = useState<Policy | null>(null);

  const loadQuote = async () => {
    setLoadingQuote(true);
    setQuoteError(null);
    try {
      const data = await getQuote(params.id);
      setQuote(data);
    } catch (err) {
      setQuoteError(
        err instanceof ApiError ? err.problem.detail : 'Error al cargar la cotización.',
      );
    } finally {
      setLoadingQuote(false);
    }
  };

  useEffect(() => {
    loadQuote();
  }, [params.id]);

  const handleEmitPolicy = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/quote/${params.id}`);
      return;
    }

    setEmitError(null);
    setEmitting(true);
    try {
      const emittedPolicy = await createPolicy(params.id);
      setPolicy(emittedPolicy);
      // Refresh quote to show BOUND status
      await loadQuote();
      router.push(`/policy/${emittedPolicy.id}`);
    } catch (err) {
      if (err instanceof ApiError) {
        setEmitError(err.problem.detail);
      } else {
        setEmitError('Error al emitir la póliza. Intente de nuevo.');
      }
    } finally {
      setEmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/quote"
          className="text-sm text-gray-500 hover:text-teal-600 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 rounded"
          aria-label="Volver a nueva cotización"
        >
          ← Nueva cotización
        </Link>
      </div>

      {loadingQuote && <LoadingSpinner message="Cargando cotización..." />}

      {quoteError && !loadingQuote && (
        <ErrorBanner message={quoteError} onRetry={loadQuote} />
      )}

      {emitError && (
        <div className="mb-4">
          <ErrorBanner message={emitError} onDismiss={() => setEmitError(null)} />
        </div>
      )}

      {policy && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">
          <p className="text-green-700 font-semibold">Póliza emitida exitosamente</p>
          <p className="text-green-600 text-sm mt-1">ID de póliza: <span className="font-mono">{policy.id}</span></p>
          <Link
            href={`/policy/${policy.id}`}
            className="inline-block mt-2 text-sm text-teal-600 underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-teal-500 rounded"
          >
            Ver detalle de la póliza →
          </Link>
        </div>
      )}

      {quote && !loadingQuote && (
        <div className="card">
          <QuoteResult
            quote={quote}
            onEmitPolicy={handleEmitPolicy}
            isEmitting={emitting}
            isAuthenticated={isAuthenticated}
          />
        </div>
      )}
    </div>
  );
}
