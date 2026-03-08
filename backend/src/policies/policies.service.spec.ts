import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { PoliciesService } from './policies.service';

const mockPrisma = {
  quote: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  policy: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
};

describe('PoliciesService', () => {
  let service: PoliciesService;

  const userId = 'user-uuid';
  const quoteId = 'quote-uuid';

  const storedQuote = { id: quoteId, status: 'QUOTED' };
  const createdPolicy = {
    id: 'policy-uuid',
    quoteId,
    userId,
    status: 'ACTIVE',
    issuedAt: new Date('2026-03-08T00:00:00.000Z'),
  };

  beforeEach(() => {
    service = new PoliciesService(mockPrisma as any);
    vi.clearAllMocks();
  });

  describe('createPolicy', () => {
    it('creates a policy and returns the expected shape', async () => {
      mockPrisma.quote.findUnique.mockResolvedValue(storedQuote);
      mockPrisma.policy.findUnique.mockResolvedValue(null);
      mockPrisma.policy.create.mockResolvedValue(createdPolicy);
      mockPrisma.quote.update.mockResolvedValue({});

      const result = await service.createPolicy({ quoteId }, userId);

      expect(result).toEqual({
        id: createdPolicy.id,
        quoteId,
        status: 'ACTIVE',
        issuedAt: createdPolicy.issuedAt,
      });
    });

    it('marks the quote as BOUND after emitting', async () => {
      mockPrisma.quote.findUnique.mockResolvedValue(storedQuote);
      mockPrisma.policy.findUnique.mockResolvedValue(null);
      mockPrisma.policy.create.mockResolvedValue(createdPolicy);
      mockPrisma.quote.update.mockResolvedValue({});

      await service.createPolicy({ quoteId }, userId);

      expect(mockPrisma.quote.update).toHaveBeenCalledWith({
        where: { id: quoteId },
        data: { status: 'BOUND' },
      });
    });

    it('persists the policy with the correct userId', async () => {
      mockPrisma.quote.findUnique.mockResolvedValue(storedQuote);
      mockPrisma.policy.findUnique.mockResolvedValue(null);
      mockPrisma.policy.create.mockResolvedValue(createdPolicy);
      mockPrisma.quote.update.mockResolvedValue({});

      await service.createPolicy({ quoteId }, userId);

      expect(mockPrisma.policy.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ quoteId, userId }) }),
      );
    });

    it('throws NotFoundException when the quote does not exist', async () => {
      mockPrisma.quote.findUnique.mockResolvedValue(null);

      await expect(service.createPolicy({ quoteId }, userId)).rejects.toThrow(NotFoundException);
    });

    it('throws ConflictException on double emission for the same quote', async () => {
      mockPrisma.quote.findUnique.mockResolvedValue(storedQuote);
      mockPrisma.policy.findUnique.mockResolvedValue({ id: 'existing-policy-uuid' });

      await expect(service.createPolicy({ quoteId }, userId)).rejects.toThrow(ConflictException);
    });

    it('does not create a policy when the quote is not found', async () => {
      mockPrisma.quote.findUnique.mockResolvedValue(null);

      await expect(service.createPolicy({ quoteId }, userId)).rejects.toThrow();

      expect(mockPrisma.policy.create).not.toHaveBeenCalled();
    });
  });

  describe('getPolicyById', () => {
    const policyWithQuote = {
      id: 'policy-uuid',
      quoteId,
      status: 'ACTIVE',
      issuedAt: new Date('2026-03-08T00:00:00.000Z'),
      quote: {
        insuranceType: 'AUTO',
        coverage: 'PREMIUM',
        age: 35,
        location: 'EC-AZUAY',
        estimatedPremium: 350,
      },
    };

    it('returns the policy with embedded quote details', async () => {
      mockPrisma.policy.findUnique.mockResolvedValue(policyWithQuote);

      const result = await service.getPolicyById('policy-uuid', userId);

      expect(result.id).toBe('policy-uuid');
      expect(result.status).toBe('ACTIVE');
      expect(result.quote.insuranceType).toBe('AUTO');
      expect(result.quote.estimatedPremium).toBe(350);
    });

    it('throws NotFoundException when the policy does not exist', async () => {
      mockPrisma.policy.findUnique.mockResolvedValue(null);

      await expect(service.getPolicyById('non-existent-uuid', userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
