import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import {
  ApiError,
  AuthResponse,
  CatalogItem,
  CreateQuoteInput,
  LoginInput,
  Policy,
  ProblemDetails,
  Quote,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Axios instance with base config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor to normalize errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ProblemDetails>) => {
    const problemDetails = error.response?.data;
    const statusCode = error.response?.status || 500;

    if (problemDetails && problemDetails.type) {
      throw new ApiError(problemDetails, statusCode);
    }

    throw new ApiError(
      {
        type: `https://httpstatuses.com/${statusCode}`,
        title: 'Error de conexión',
        status: statusCode,
        detail: error.message || 'No se pudo conectar con el servidor',
        instance: error.config?.url || '/',
      },
      statusCode,
    );
  },
);

// ============ Auth ============

export async function login(data: LoginInput): Promise<AuthResponse> {
  const res = await apiClient.post<AuthResponse>('/auth/login', data);
  return res.data;
}

// ============ Catalogs ============

export async function getInsuranceTypes(): Promise<CatalogItem[]> {
  const res = await apiClient.get<{ items: CatalogItem[] }>('/catalogs/insurance-types');
  return res.data.items;
}

export async function getCoverages(insuranceType?: string): Promise<CatalogItem[]> {
  const params = insuranceType ? { insuranceType } : {};
  const res = await apiClient.get<{ items: CatalogItem[] }>('/catalogs/coverages', { params });
  return res.data.items;
}

export async function getLocations(): Promise<CatalogItem[]> {
  const res = await apiClient.get<{ items: CatalogItem[] }>('/catalogs/locations');
  return res.data.items;
}

// ============ Quotes ============

export async function createQuote(data: CreateQuoteInput): Promise<Quote> {
  const res = await apiClient.post<Quote>('/quotes', data);
  return res.data;
}

export async function getQuote(id: string): Promise<Quote> {
  const res = await apiClient.get<Quote>(`/quotes/${id}`);
  return res.data;
}

// ============ Policies ============

export async function createPolicy(quoteId: string): Promise<Policy> {
  const res = await apiClient.post<Policy>('/policies', { quoteId });
  return res.data;
}

export async function getPolicy(id: string): Promise<Policy> {
  const res = await apiClient.get<Policy>(`/policies/${id}`);
  return res.data;
}
