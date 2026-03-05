import { Injectable } from '@nestjs/common';

export interface CatalogItem {
  code: string;
  name: string;
}

export interface CoverageItem extends CatalogItem {
  insuranceType: string;
}

export interface LocationItem extends CatalogItem {
  province: string;
}

// Catalog definitions - In production these would be in DB or config service
export const INSURANCE_TYPES: CatalogItem[] = [
  { code: 'AUTO', name: 'Seguro de Auto' },
  { code: 'SALUD', name: 'Seguro de Salud' },
  { code: 'HOGAR', name: 'Seguro de Hogar' },
];

export const COVERAGES: CoverageItem[] = [
  { code: 'BASICA', name: 'Cobertura Básica', insuranceType: 'AUTO' },
  { code: 'ESTANDAR', name: 'Cobertura Estándar', insuranceType: 'AUTO' },
  { code: 'PREMIUM', name: 'Cobertura Premium', insuranceType: 'AUTO' },
  { code: 'BASICA', name: 'Cobertura Básica', insuranceType: 'SALUD' },
  { code: 'ESTANDAR', name: 'Cobertura Estándar', insuranceType: 'SALUD' },
  { code: 'PREMIUM', name: 'Cobertura Premium', insuranceType: 'SALUD' },
  { code: 'BASICA', name: 'Cobertura Básica', insuranceType: 'HOGAR' },
  { code: 'ESTANDAR', name: 'Cobertura Estándar', insuranceType: 'HOGAR' },
  { code: 'PREMIUM', name: 'Cobertura Premium', insuranceType: 'HOGAR' },
];

export const LOCATIONS: LocationItem[] = [
  { code: 'EC-AZUAY', name: 'Azuay', province: 'Azuay' },
  { code: 'EC-BOLIVAR', name: 'Bolívar', province: 'Bolívar' },
  { code: 'EC-CANAR', name: 'Cañar', province: 'Cañar' },
  { code: 'EC-CARCHI', name: 'Carchi', province: 'Carchi' },
  { code: 'EC-CHIMBORAZO', name: 'Chimborazo', province: 'Chimborazo' },
  { code: 'EC-COTOPAXI', name: 'Cotopaxi', province: 'Cotopaxi' },
  { code: 'EC-ELPORO', name: 'El Oro', province: 'El Oro' },
  { code: 'EC-ESMERALDAS', name: 'Esmeraldas', province: 'Esmeraldas' },
  { code: 'EC-GALAPAGOS', name: 'Galápagos', province: 'Galápagos' },
  { code: 'EC-GUAYAS', name: 'Guayas', province: 'Guayas' },
  { code: 'EC-IMBABURA', name: 'Imbabura', province: 'Imbabura' },
  { code: 'EC-LOJA', name: 'Loja', province: 'Loja' },
  { code: 'EC-LOSRIOS', name: 'Los Ríos', province: 'Los Ríos' },
  { code: 'EC-MANABI', name: 'Manabí', province: 'Manabí' },
  { code: 'EC-MORONASANTIAGO', name: 'Morona Santiago', province: 'Morona Santiago' },
  { code: 'EC-NAPO', name: 'Napo', province: 'Napo' },
  { code: 'EC-ORELLANA', name: 'Orellana', province: 'Orellana' },
  { code: 'EC-PASTAZA', name: 'Pastaza', province: 'Pastaza' },
  { code: 'EC-PICHINCHA', name: 'Pichincha', province: 'Pichincha' },
  { code: 'EC-SANTAELENA', name: 'Santa Elena', province: 'Santa Elena' },
  { code: 'EC-SANTODOMINGO', name: 'Santo Domingo de los Tsáchilas', province: 'Santo Domingo' },
  { code: 'EC-SUCUMBIOS', name: 'Sucumbíos', province: 'Sucumbíos' },
  { code: 'EC-TUNGURAHUA', name: 'Tungurahua', province: 'Tungurahua' },
  { code: 'EC-ZAMORA', name: 'Zamora Chinchipe', province: 'Zamora Chinchipe' },
];

@Injectable()
export class CatalogsService {
  getInsuranceTypes() {
    return { items: INSURANCE_TYPES };
  }

  getCoverages(insuranceType?: string) {
    const filtered = insuranceType
      ? COVERAGES.filter((c) => c.insuranceType === insuranceType.toUpperCase())
      : COVERAGES;

    return {
      items: filtered.map(({ code, name }) => ({ code, name })),
    };
  }

  getLocations() {
    return { items: LOCATIONS.map(({ code, name }) => ({ code, name })) };
  }

  isValidInsuranceType(code: string): boolean {
    return INSURANCE_TYPES.some((t) => t.code === code);
  }

  isValidCoverage(code: string, insuranceType: string): boolean {
    return COVERAGES.some(
      (c) => c.code === code && c.insuranceType === insuranceType,
    );
  }

  isValidLocation(code: string): boolean {
    return LOCATIONS.some((l) => l.code === code);
  }
}
