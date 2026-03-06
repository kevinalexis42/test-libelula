import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QuotesService } from './quotes.service';
import { CatalogsService } from '../catalogs/catalogs.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { InsuranceType, CoverageType } from './dto/create-quote.dto';

// Mock PrismaService
const mockPrisma = {
  quote: {
    create: vi.fn(),
    findUnique: vi.fn(),
  },
};

describe('QuotesService', () => {
  let quotesService: QuotesService;
  let catalogsService: CatalogsService;

  // validDto disponible en todos los describe anidados
  const validDto = {
    insuranceType: InsuranceType.AUTO,
    coverage: CoverageType.PREMIUM,
    age: 35,
    location: 'EC-AZUAY',
  };

  beforeEach(() => {
    catalogsService = new CatalogsService();
    quotesService = new QuotesService(mockPrisma as any, catalogsService);
    vi.clearAllMocks();
  });

  describe('createQuote', () => {
    it('should create a quote with correct premium calculation', async () => {
      const mockQuote = {
        id: 'test-uuid',
        status: 'QUOTED',
        insuranceType: 'AUTO',
        coverage: 'PREMIUM',
        age: 35,
        location: 'EC-AZUAY',
        estimatedPremium: 350,
        breakdown: [
          { concept: 'BASE', amount: 200 },
          { concept: 'AGE_FACTOR', amount: 60 },
          { concept: 'LOCATION_FACTOR', amount: 40 },
          { concept: 'COVERAGE_FACTOR', amount: 50 },
        ],
        createdAt: new Date(),
      };

      mockPrisma.quote.create.mockResolvedValue(mockQuote);

      const result = await quotesService.createQuote(validDto);

      expect(result.id).toBe('test-uuid');
      expect(result.status).toBe('QUOTED');
      expect(result.estimatedPremium).toBe(350);
      expect(result.breakdown).toHaveLength(4);
      expect(result.breakdown[0]).toEqual({ concept: 'BASE', amount: 200 });
    });

    it('should calculate AGE_FACTOR correctly for different age ranges', async () => {
      const youngDto = { ...validDto, age: 22 };
      mockPrisma.quote.create.mockResolvedValue({
        id: 'uuid',
        status: 'QUOTED',
        ...youngDto,
        estimatedPremium: 340,
        breakdown: [],
        createdAt: new Date(),
      });

      await quotesService.createQuote(youngDto);
      const callArgs = mockPrisma.quote.create.mock.calls[0][0];
      const ageFactorItem = callArgs.data.breakdown.find(
        (b: any) => b.concept === 'AGE_FACTOR',
      );
      expect(ageFactorItem.amount).toBe(50);
    });

    it('should throw BadRequestException for invalid insuranceType', async () => {
      const invalidDto = { ...validDto, insuranceType: 'VIDA' as any };
      await expect(quotesService.createQuote(invalidDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid location', async () => {
      const invalidDto = { ...validDto, location: 'INVALID-LOCATION' };
      await expect(quotesService.createQuote(invalidDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid coverage', async () => {
      const invalidDto = { ...validDto, coverage: 'FULL' as any };
      await expect(quotesService.createQuote(invalidDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getQuoteById', () => {
    it('should return quote when found', async () => {
      const mockQuote = {
        id: 'test-uuid',
        status: 'QUOTED',
        insuranceType: 'AUTO',
        coverage: 'PREMIUM',
        age: 35,
        location: 'EC-AZUAY',
        estimatedPremium: 350,
        breakdown: [
          { concept: 'BASE', amount: 200 },
          { concept: 'AGE_FACTOR', amount: 60 },
          { concept: 'LOCATION_FACTOR', amount: 40 },
          { concept: 'COVERAGE_FACTOR', amount: 50 },
        ],
        createdAt: new Date(),
      };

      mockPrisma.quote.findUnique.mockResolvedValue(mockQuote);

      const result = await quotesService.getQuoteById('test-uuid');
      expect(result.id).toBe('test-uuid');
      expect(result.inputs.insuranceType).toBe('AUTO');
    });

    it('should throw NotFoundException when quote not found', async () => {
      mockPrisma.quote.findUnique.mockResolvedValue(null);
      await expect(quotesService.getQuoteById('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('Premium calculation logic', () => {
    it('should calculate SALUD BASE as 150', async () => {
      const saludDto = { ...validDto, insuranceType: InsuranceType.SALUD, coverage: CoverageType.BASICA };
      mockPrisma.quote.create.mockResolvedValue({
        id: 'uuid',
        status: 'QUOTED',
        ...saludDto,
        estimatedPremium: 240,
        breakdown: [],
        createdAt: new Date(),
      });

      await quotesService.createQuote(saludDto);
      const callArgs = mockPrisma.quote.create.mock.calls[0][0];
      const baseItem = callArgs.data.breakdown.find((b: any) => b.concept === 'BASE');
      expect(baseItem.amount).toBe(150);
    });

    it('should calculate HOGAR BASE as 100', async () => {
      const hogarDto = { ...validDto, insuranceType: InsuranceType.HOGAR };
      mockPrisma.quote.create.mockResolvedValue({
        id: 'uuid',
        status: 'QUOTED',
        ...hogarDto,
        estimatedPremium: 240,
        breakdown: [],
        createdAt: new Date(),
      });

      await quotesService.createQuote(hogarDto);
      const callArgs = mockPrisma.quote.create.mock.calls[0][0];
      const baseItem = callArgs.data.breakdown.find((b: any) => b.concept === 'BASE');
      expect(baseItem.amount).toBe(100);
    });
  });
});
