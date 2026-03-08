import { describe, it, expect } from 'vitest';
import { CatalogsService } from './catalogs.service';

describe('CatalogsService', () => {
  const service = new CatalogsService();

  describe('getInsuranceTypes', () => {
    it('returns exactly the three supported types', () => {
      const { items } = service.getInsuranceTypes();

      expect(items).toHaveLength(3);
      expect(items.map((i) => i.code)).toEqual(['AUTO', 'SALUD', 'HOGAR']);
    });

    it('each item has code and name', () => {
      const { items } = service.getInsuranceTypes();

      for (const item of items) {
        expect(item).toHaveProperty('code');
        expect(item).toHaveProperty('name');
      }
    });
  });

  describe('getCoverages', () => {
    it('returns all coverages when no filter is applied', () => {
      const { items } = service.getCoverages();

      expect(items.length).toBe(9); // 3 types × 3 coverage levels
    });

    it('filters by insurance type', () => {
      const { items } = service.getCoverages('AUTO');

      expect(items).toHaveLength(3);
      expect(items.map((i) => i.code)).toEqual(['BASICA', 'ESTANDAR', 'PREMIUM']);
    });

    it('is case-insensitive for the filter parameter', () => {
      const upper = service.getCoverages('SALUD');
      const lower = service.getCoverages('salud');

      expect(upper.items).toEqual(lower.items);
    });

    it('returned items only expose code and name, not insuranceType', () => {
      const { items } = service.getCoverages('HOGAR');

      for (const item of items) {
        expect(item).toHaveProperty('code');
        expect(item).toHaveProperty('name');
        expect(item).not.toHaveProperty('insuranceType');
      }
    });
  });

  describe('getLocations', () => {
    it('returns all 24 provinces', () => {
      const { items } = service.getLocations();

      expect(items).toHaveLength(24);
    });

    it('includes known province codes', () => {
      const { items } = service.getLocations();
      const codes = items.map((i) => i.code);

      expect(codes).toContain('EC-PICHINCHA');
      expect(codes).toContain('EC-GUAYAS');
      expect(codes).toContain('EC-AZUAY');
    });

    it('returned items only expose code and name', () => {
      const { items } = service.getLocations();

      for (const item of items) {
        expect(item).toHaveProperty('code');
        expect(item).toHaveProperty('name');
        expect(item).not.toHaveProperty('province');
      }
    });
  });

  describe('isValidInsuranceType', () => {
    it.each(['AUTO', 'SALUD', 'HOGAR'])('returns true for "%s"', (code) => {
      expect(service.isValidInsuranceType(code)).toBe(true);
    });

    it.each(['VIDA', 'auto', '', 'OTRO'])('returns false for "%s"', (code) => {
      expect(service.isValidInsuranceType(code)).toBe(false);
    });
  });

  describe('isValidCoverage', () => {
    it('returns true when coverage and insurance type are a valid combination', () => {
      expect(service.isValidCoverage('BASICA', 'AUTO')).toBe(true);
      expect(service.isValidCoverage('ESTANDAR', 'SALUD')).toBe(true);
      expect(service.isValidCoverage('PREMIUM', 'HOGAR')).toBe(true);
    });

    it('returns false for coverage codes that do not exist', () => {
      expect(service.isValidCoverage('FULL', 'AUTO')).toBe(false);
    });
  });

  describe('isValidLocation', () => {
    it('returns true for known province codes', () => {
      expect(service.isValidLocation('EC-PICHINCHA')).toBe(true);
      expect(service.isValidLocation('EC-GALAPAGOS')).toBe(true);
    });

    it.each(['INVALID', 'EC-MADRID', ''])('returns false for "%s"', (code) => {
      expect(service.isValidLocation(code)).toBe(false);
    });
  });
});
