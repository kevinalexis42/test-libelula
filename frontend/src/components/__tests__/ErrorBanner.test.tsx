import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBanner } from '../ErrorBanner';

describe('ErrorBanner', () => {
  it('renders error message', () => {
    render(<ErrorBanner message="Something went wrong" />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('has role="alert" for accessibility', () => {
    render(<ErrorBanner message="Error!" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('shows retry button when onRetry is provided', () => {
    const mockRetry = vi.fn();
    render(<ErrorBanner message="Error!" onRetry={mockRetry} />);
    const retryBtn = screen.getByRole('button', { name: /Reintentar/i });
    expect(retryBtn).toBeInTheDocument();
    fireEvent.click(retryBtn);
    expect(mockRetry).toHaveBeenCalledOnce();
  });

  it('shows dismiss button when onDismiss is provided', () => {
    const mockDismiss = vi.fn();
    render(<ErrorBanner message="Error!" onDismiss={mockDismiss} />);
    const dismissBtn = screen.getByRole('button', { name: /Cerrar error/i });
    fireEvent.click(dismissBtn);
    expect(mockDismiss).toHaveBeenCalledOnce();
  });

  it('does not show buttons when handlers not provided', () => {
    render(<ErrorBanner message="Error!" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
