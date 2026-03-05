'use client';

import { useEffect, useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getCoverages, getInsuranceTypes, getLocations } from '@/lib/api';
import { CatalogItem, InsuranceType, CoverageType, ApiError } from '@/types';
import { ErrorBanner } from './ErrorBanner';
import { LoadingSpinner } from './LoadingSpinner';

const quoteSchema = z.object({
  insuranceType: z.enum(['AUTO', 'SALUD', 'HOGAR'], {
    required_error: 'Seleccione un tipo de seguro',
  }),
  coverage: z.enum(['BASICA', 'ESTANDAR', 'PREMIUM'], {
    required_error: 'Seleccione una cobertura',
  }),
  age: z
    .number({ required_error: 'La edad es requerida', invalid_type_error: 'Ingrese un número' })
    .int('La edad debe ser un número entero')
    .min(18, 'La edad mínima es 18 años')
    .max(100, 'La edad máxima es 100 años'),
  location: z.string().min(1, 'Seleccione una ubicación'),
});

export type QuoteFormData = z.infer<typeof quoteSchema>;

interface QuoteFormProps {
  defaultInsuranceType?: InsuranceType;
  onSubmit: (data: QuoteFormData) => Promise<void>;
  isLoading?: boolean;
}

interface CatalogState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
}

export function QuoteForm({ defaultInsuranceType, onSubmit, isLoading }: QuoteFormProps) {
  const [insuranceTypes, setInsuranceTypes] = useState<CatalogState<CatalogItem>>({
    data: [],
    loading: true,
    error: null,
  });
  const [coverages, setCoverages] = useState<CatalogState<CatalogItem>>({
    data: [],
    loading: false,
    error: null,
  });
  const [locations, setLocations] = useState<CatalogState<CatalogItem>>({
    data: [],
    loading: true,
    error: null,
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      insuranceType: defaultInsuranceType,
    },
  });

  const selectedInsuranceType = watch('insuranceType');

  // Load insurance types and locations in parallel
  const loadCatalogs = useCallback(async () => {
    setInsuranceTypes((prev) => ({ ...prev, loading: true, error: null }));
    setLocations((prev) => ({ ...prev, loading: true, error: null }));

    const [typesResult, locationsResult] = await Promise.allSettled([
      getInsuranceTypes(),
      getLocations(),
    ]);

    setInsuranceTypes({
      data: typesResult.status === 'fulfilled' ? typesResult.value : [],
      loading: false,
      error:
        typesResult.status === 'rejected'
          ? typesResult.reason instanceof ApiError
            ? typesResult.reason.problem.detail
            : 'Error al cargar tipos de seguro'
          : null,
    });

    setLocations({
      data: locationsResult.status === 'fulfilled' ? locationsResult.value : [],
      loading: false,
      error:
        locationsResult.status === 'rejected'
          ? locationsResult.reason instanceof ApiError
            ? locationsResult.reason.problem.detail
            : 'Error al cargar ubicaciones'
          : null,
    });
  }, []);

  useEffect(() => {
    loadCatalogs();
  }, [loadCatalogs]);

  // Load coverages when insuranceType changes
  const loadCoverages = useCallback(async (insuranceType: string) => {
    setCoverages({ data: [], loading: true, error: null });
    try {
      const data = await getCoverages(insuranceType);
      setCoverages({ data, loading: false, error: null });
    } catch (error) {
      setCoverages({
        data: [],
        loading: false,
        error:
          error instanceof ApiError ? error.problem.detail : 'Error al cargar coberturas',
      });
    }
  }, []);

  useEffect(() => {
    if (selectedInsuranceType) {
      loadCoverages(selectedInsuranceType);
    }
  }, [selectedInsuranceType, loadCoverages]);

  const catalogsLoading = insuranceTypes.loading || locations.loading;
  const catalogsError = insuranceTypes.error || locations.error;

  if (catalogsLoading) {
    return <LoadingSpinner message="Cargando catálogos de seguros..." />;
  }

  if (catalogsError) {
    return (
      <ErrorBanner
        message={catalogsError}
        onRetry={loadCatalogs}
      />
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-label="Formulario de cotización"
      className="space-y-5"
    >
      {/* Insurance Type */}
      <div>
        <label htmlFor="insuranceType" className="block text-sm font-medium text-gray-700 mb-1">
          Tipo de Seguro <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <select
          id="insuranceType"
          className={`input-field ${errors.insuranceType ? 'input-error' : ''}`}
          aria-required="true"
          aria-describedby={errors.insuranceType ? 'insuranceType-error' : undefined}
          aria-invalid={!!errors.insuranceType}
          {...register('insuranceType')}
        >
          <option value="">Seleccione un tipo de seguro</option>
          {insuranceTypes.data.map((type) => (
            <option key={type.code} value={type.code}>
              {type.name}
            </option>
          ))}
        </select>
        {errors.insuranceType && (
          <p id="insuranceType-error" className="mt-1 text-sm text-red-600" role="alert">
            {errors.insuranceType.message}
          </p>
        )}
      </div>

      {/* Coverage */}
      <div>
        <label htmlFor="coverage" className="block text-sm font-medium text-gray-700 mb-1">
          Cobertura <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        {coverages.loading ? (
          <div className="input-field bg-gray-50 text-gray-400 flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Cargando coberturas...</span>
          </div>
        ) : (
          <select
            id="coverage"
            className={`input-field ${errors.coverage ? 'input-error' : ''}`}
            disabled={!selectedInsuranceType || coverages.loading}
            aria-required="true"
            aria-describedby={errors.coverage ? 'coverage-error' : undefined}
            aria-invalid={!!errors.coverage}
            {...register('coverage')}
          >
            <option value="">
              {selectedInsuranceType ? 'Seleccione una cobertura' : 'Primero seleccione tipo de seguro'}
            </option>
            {coverages.data.map((cov) => (
              <option key={cov.code} value={cov.code}>
                {cov.name}
              </option>
            ))}
          </select>
        )}
        {coverages.error && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {coverages.error}{' '}
            <button
              type="button"
              onClick={() => selectedInsuranceType && loadCoverages(selectedInsuranceType)}
              className="underline hover:no-underline"
            >
              Reintentar
            </button>
          </p>
        )}
        {errors.coverage && (
          <p id="coverage-error" className="mt-1 text-sm text-red-600" role="alert">
            {errors.coverage.message}
          </p>
        )}
      </div>

      {/* Age */}
      <div>
        <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
          Edad <span aria-hidden="true" className="text-red-500">*</span>
          <span className="text-gray-400 font-normal ml-1">(18-100 años)</span>
        </label>
        <Controller
          name="age"
          control={control}
          render={({ field }) => (
            <input
              id="age"
              type="number"
              min={18}
              max={100}
              className={`input-field ${errors.age ? 'input-error' : ''}`}
              placeholder="35"
              aria-required="true"
              aria-describedby={errors.age ? 'age-error' : undefined}
              aria-invalid={!!errors.age}
              {...field}
              onChange={(e) => field.onChange(e.target.valueAsNumber)}
            />
          )}
        />
        {errors.age && (
          <p id="age-error" className="mt-1 text-sm text-red-600" role="alert">
            {errors.age.message}
          </p>
        )}
      </div>

      {/* Location */}
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
          Ubicación <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <select
          id="location"
          className={`input-field ${errors.location ? 'input-error' : ''}`}
          aria-required="true"
          aria-describedby={errors.location ? 'location-error' : undefined}
          aria-invalid={!!errors.location}
          {...register('location')}
        >
          <option value="">Seleccione una provincia</option>
          {locations.data.map((loc) => (
            <option key={loc.code} value={loc.code}>
              {loc.name}
            </option>
          ))}
        </select>
        {errors.location && (
          <p id="location-error" className="mt-1 text-sm text-red-600" role="alert">
            {errors.location.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="btn-primary w-full py-3 text-base mt-2"
        aria-busy={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Calculando cotización...
          </span>
        ) : (
          'Obtener Cotización'
        )}
      </button>
    </form>
  );
}
