'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Quote } from '@/types';

const CONCEPT_LABELS: Record<string, string> = {
  BASE: 'Prima base',
  AGE_FACTOR: 'Factor por edad',
  LOCATION_FACTOR: 'Factor por ubicación',
  COVERAGE_FACTOR: 'Factor por cobertura',
};

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

interface QuoteResultProps {
  quote: Quote;
  onEmitPolicy: () => Promise<void>;
  isEmitting?: boolean;
  isAuthenticated?: boolean;
}

interface ConfirmModalProps {
  quote: Quote;
  onConfirm: () => void;
  onCancel: () => void;
  isEmitting: boolean;
}

function ConfirmModal({ quote, onConfirm, onCancel, isEmitting }: ConfirmModalProps) {
  const [accepted, setAccepted] = useState(false);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-desc"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <h2 id="confirm-modal-title" className="text-xl font-bold text-gray-900 mb-2">
          Confirmar emisión de póliza
        </h2>
        <p id="confirm-modal-desc" className="text-gray-500 text-sm mb-5">
          Estás a punto de emitir una póliza. Esta acción es permanente y no puede deshacerse.
        </p>

        {/* Summary */}
        <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Tipo de seguro</span>
            <span className="font-semibold">{INSURANCE_LABELS[quote.inputs.insuranceType] || quote.inputs.insuranceType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Cobertura</span>
            <span className="font-semibold">{COVERAGE_LABELS[quote.inputs.coverage] || quote.inputs.coverage}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Ubicación</span>
            <span className="font-semibold">{quote.inputs.location}</span>
          </div>
          <div className="flex justify-between border-t pt-2 mt-2">
            <span className="text-gray-700 font-semibold">Prima mensual</span>
            <span className="font-bold text-teal-700 text-base">${quote.estimatedPremium.toFixed(2)} USD</span>
          </div>
        </div>

        {/* Acceptance checkbox */}
        <label className="flex items-start gap-3 mb-5 cursor-pointer">
          <input
            type="checkbox"
            id="accept-terms"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
            aria-required="true"
          />
          <span className="text-sm text-gray-600">
            He revisado los datos de la cotización y acepto emitir la póliza con las condiciones
            mostradas.
          </span>
        </label>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isEmitting}
            className="btn-secondary flex-1 py-2.5"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={!accepted || isEmitting}
            className="btn-primary flex-1 py-2.5"
            aria-busy={isEmitting}
          >
            {isEmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Emitiendo...
              </span>
            ) : (
              'Emitir Póliza'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export function QuoteResult({ quote, onEmitPolicy, isEmitting, isAuthenticated }: QuoteResultProps) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleEmitClick = () => {
    setShowConfirmModal(true);
  };

  const handleConfirm = async () => {
    setShowConfirmModal(false);
    await onEmitPolicy();
  };

  const handleCancel = () => {
    setShowConfirmModal(false);
  };

  return (
    <>
      {/* Confirmation modal */}
      {showConfirmModal && (
        <ConfirmModal
          quote={quote}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          isEmitting={isEmitting || false}
        />
      )}

      <div className="space-y-6" aria-label="Resultado de cotización">
        {/* Status badge */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Tu Cotización</h2>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            {quote.status === 'QUOTED' ? 'Pendiente' : 'Emitida'}
          </span>
        </div>

        {/* Quote ID */}
        <div className="text-xs text-gray-400 font-mono">ID: {quote.id}</div>

        {/* Insurance details */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-0.5">Tipo de seguro</p>
            <p className="font-semibold text-gray-900">
              {INSURANCE_LABELS[quote.inputs.insuranceType] || quote.inputs.insuranceType}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-0.5">Cobertura</p>
            <p className="font-semibold text-gray-900">
              {COVERAGE_LABELS[quote.inputs.coverage] || quote.inputs.coverage}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-0.5">Edad</p>
            <p className="font-semibold text-gray-900">{quote.inputs.age} años</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-0.5">Ubicación</p>
            <p className="font-semibold text-gray-900">{quote.inputs.location}</p>
          </div>
        </div>

        {/* Premium */}
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-5 text-center">
          <p className="text-sm text-teal-600 font-medium mb-1">Prima mensual estimada</p>
          <p className="text-4xl font-bold text-teal-700">
            ${quote.estimatedPremium.toFixed(2)}
          </p>
          <p className="text-xs text-teal-500 mt-1">USD / mes</p>
        </div>

        {/* Breakdown */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Desglose del cálculo</h3>
          <div className="space-y-2">
            {quote.breakdown.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <span className="text-sm text-gray-600">
                  {CONCEPT_LABELS[item.concept] || item.concept}
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  +${item.amount.toFixed(2)}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between py-2 pt-3 border-t-2 border-teal-200">
              <span className="font-bold text-gray-900">Total</span>
              <span className="font-bold text-teal-700 text-lg">
                ${quote.estimatedPremium.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Emit policy action */}
        {quote.status === 'QUOTED' && (
          <div className="pt-2">
            {isAuthenticated ? (
              <button
                onClick={handleEmitClick}
                disabled={isEmitting}
                className="btn-primary w-full py-3 text-base"
                aria-busy={isEmitting}
              >
                Confirmar y Emitir Póliza
              </button>
            ) : (
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-3">
                  Debes iniciar sesión para emitir tu póliza
                </p>
                <Link
                  href={`/login?redirect=/quote/${quote.id}`}
                  className="btn-primary inline-block px-6 py-3"
                >
                  Iniciar Sesión para Emitir
                </Link>
              </div>
            )}
          </div>
        )}

        {quote.status === 'BOUND' && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <p className="text-green-700 font-semibold">Póliza emitida exitosamente</p>
            <p className="text-green-600 text-sm mt-1">Esta cotización ya ha sido procesada.</p>
          </div>
        )}
      </div>
    </>
  );
}
