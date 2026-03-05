// ============ Catalog Types ============

export interface CatalogItem {
  code: string;
  name: string;
}

export type InsuranceType = 'AUTO' | 'SALUD' | 'HOGAR';
export type CoverageType = 'BASICA' | 'ESTANDAR' | 'PREMIUM';

// ============ Quote Types ============

export interface CreateQuoteInput {
  insuranceType: InsuranceType;
  coverage: CoverageType;
  age: number;
  location: string;
}

export interface BreakdownItem {
  concept: string;
  amount: number;
}

export interface Quote {
  id: string;
  status: 'QUOTED' | 'BOUND';
  inputs: CreateQuoteInput;
  estimatedPremium: number;
  breakdown: BreakdownItem[];
  createdAt: string;
}

// ============ Policy Types ============

export interface Policy {
  id: string;
  quoteId: string;
  status: 'ACTIVE' | 'CANCELLED';
  issuedAt: string;
  quote?: {
    insuranceType: string;
    coverage: string;
    age: number;
    location: string;
    estimatedPremium: number;
  };
}

// ============ Auth Types ============

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: 'Bearer';
}

// ============ API Error Type (Problem Details RFC 7807) ============

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  errors?: string[];
}

export class ApiError extends Error {
  constructor(
    public readonly problem: ProblemDetails,
    public readonly statusCode: number,
  ) {
    super(problem.detail);
  }
}
