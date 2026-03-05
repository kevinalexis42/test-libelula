'use client';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

export function LoadingSpinner({ message, size = 'md' }: LoadingSpinnerProps) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col items-center justify-center gap-3 p-8">
      <svg
        className={`animate-spin ${sizes[size]} text-teal-600`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      {message && <p className="text-gray-500 text-sm">{message}</p>}
      <span className="sr-only">{message || 'Cargando...'}</span>
    </div>
  );
}
