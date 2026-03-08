import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuoteForm } from '../QuoteForm';

// Mock API module
vi.mock('@/lib/api', () => ({
  getInsuranceTypes: vi.fn().mockResolvedValue([
    { code: 'AUTO', name: 'Seguro de Auto' },
    { code: 'SALUD', name: 'Seguro de Salud' },
    { code: 'HOGAR', name: 'Seguro de Hogar' },
  ]),
  getCoverages: vi.fn().mockResolvedValue([
    { code: 'BASICA', name: 'Cobertura Básica' },
    { code: 'ESTANDAR', name: 'Cobertura Estándar' },
    { code: 'PREMIUM', name: 'Cobertura Premium' },
  ]),
  getLocations: vi.fn().mockResolvedValue([
    { code: 'EC-AZUAY', name: 'Azuay' },
    { code: 'EC-PICHINCHA', name: 'Pichincha' },
    { code: 'EC-GUAYAS', name: 'Guayas' },
  ]),
}));

describe('QuoteForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders the form with all fields after loading catalogs', async () => {
    render(<QuoteForm onSubmit={mockOnSubmit} />);

    // Initially shows loading (message rendered in <p> and <span sr-only> — use getAllByText)
    expect(screen.getAllByText(/Cargando catálogos/i)[0]).toBeInTheDocument();

    // Wait for catalogs to load
    await waitFor(() => {
      expect(screen.getByLabelText(/Tipo de Seguro/i)).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/Cobertura/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Edad/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Ubicación/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Obtener Cotización/i })).toBeInTheDocument();
  });

  it('shows validation errors when form is submitted empty', async () => {
    const user = userEvent.setup();
    render(<QuoteForm onSubmit={mockOnSubmit} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Tipo de Seguro/i)).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /Obtener Cotización/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Seleccione un tipo de seguro/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('shows age validation error for out-of-range values', async () => {
    const user = userEvent.setup();
    render(<QuoteForm onSubmit={mockOnSubmit} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Edad/i)).toBeInTheDocument();
    });

    const ageInput = screen.getByLabelText(/Edad/i);
    await user.clear(ageInput);
    await user.type(ageInput, '15');

    const submitButton = screen.getByRole('button', { name: /Obtener Cotización/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/La edad mínima es 18/i)).toBeInTheDocument();
    });
  });

  it('calls onSubmit with correct data when form is valid', async () => {
    const user = userEvent.setup();
    render(<QuoteForm onSubmit={mockOnSubmit} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Tipo de Seguro/i)).toBeInTheDocument();
    });

    // Select insurance type
    await user.selectOptions(screen.getByLabelText(/Tipo de Seguro/i), 'AUTO');

    // Wait for coverages to load
    await waitFor(() => {
      expect(screen.queryByText(/Calculando cotización/i)).not.toBeInTheDocument();
    });

    // Select coverage (after insurance type is selected)
    await waitFor(() => {
      const coverageSelect = screen.getByLabelText(/Cobertura/i);
      return coverageSelect;
    });
    await user.selectOptions(screen.getByLabelText(/Cobertura/i), 'PREMIUM');

    // Enter age
    const ageInput = screen.getByLabelText(/Edad/i);
    await user.clear(ageInput);
    await user.type(ageInput, '35');

    // Select location
    await user.selectOptions(screen.getByLabelText(/Ubicación/i), 'EC-AZUAY');

    // Submit
    await user.click(screen.getByRole('button', { name: /Obtener Cotización/i }));

    // RHF calls onSubmit(data, event) — assert on first argument only
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        { insuranceType: 'AUTO', coverage: 'PREMIUM', age: 35, location: 'EC-AZUAY' },
        expect.anything(),
      );
    });
  });

  it('shows loading state when isLoading is true', async () => {
    render(<QuoteForm onSubmit={mockOnSubmit} isLoading={true} />);

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  it('has proper accessibility attributes', async () => {
    render(<QuoteForm onSubmit={mockOnSubmit} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Tipo de Seguro/i)).toBeInTheDocument();
    });

    // Check aria-required attributes
    const insuranceTypeSelect = screen.getByLabelText(/Tipo de Seguro/i);
    expect(insuranceTypeSelect).toHaveAttribute('aria-required', 'true');

    const ageInput = screen.getByLabelText(/Edad/i);
    expect(ageInput).toHaveAttribute('aria-required', 'true');
  });
});
