import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CatalogsService } from '../catalogs/catalogs.service';
import { CreateQuoteDto } from './dto/create-quote.dto';

export interface BreakdownItem {
  concept: string;
  amount: number;
}

// Tarifas base anuales en USD. Valores representativos para el MVP;
// en producción vendrían de un motor actuarial externo.
const BASE_PREMIUMS: Record<string, number> = {
  AUTO: 200,
  SALUD: 150,
  HOGAR: 100,
};

// Recargo plano sobre la tarifa base según el nivel de cobertura contratado.
const COVERAGE_FACTORS: Record<string, number> = {
  BASICA: 0,
  ESTANDAR: 30,
  PREMIUM: 50,
};

// Recargo por riesgo geográfico. Las zonas costeras y de mayor densidad
// tienen históricamente mayor siniestralidad.
const LOCATION_FACTORS: Record<string, number> = {
  'EC-GUAYAS': 50,
  'EC-PICHINCHA': 45,
  'EC-MANABI': 40,
  'EC-LOSRIOS': 38,
  'EC-ESMERALDAS': 42,
  'EC-SANTAELENA': 35,
  'EC-AZUAY': 40,
  'EC-LOJA': 30,
  'EC-TUNGURAHUA': 35,
  'EC-CHIMBORAZO': 30,
  'EC-COTOPAXI': 28,
  'EC-IMBABURA': 32,
  'EC-CARCHI': 25,
  'EC-BOLIVAR': 25,
  'EC-CANAR': 27,
  'EC-ELPORO': 38,
  'EC-GALAPAGOS': 20,
  'EC-NAPO': 22,
  'EC-PASTAZA': 20,
  'EC-MORONA': 20,
  'EC-MORONASANTIAGO': 20,
  'EC-ZAMORA': 20,
  'EC-SUCUMBIOS': 22,
  'EC-ORELLANA': 22,
  'EC-SANTODOMINGO': 35,
};

@Injectable()
export class QuotesService {
  private readonly logger = new Logger(QuotesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly catalogsService: CatalogsService,
  ) {}

  async createQuote(dto: CreateQuoteDto) {
    const { insuranceType, coverage, age, location } = dto;
    this.logger.log(`Creating quote: ${insuranceType}/${coverage} age=${age} loc=${location}`);

    // El DTO ya valida el formato y los enums con class-validator, pero aquí
    // revalidamos contra el catálogo para verificar que la cobertura es compatible
    // con el tipo de seguro elegido — esa relación no se puede expresar con decoradores.
    if (!this.catalogsService.isValidInsuranceType(insuranceType)) {
      throw new BadRequestException(
        `insuranceType '${insuranceType}' no es válido. Valores permitidos: AUTO, SALUD, HOGAR`,
      );
    }

    if (!this.catalogsService.isValidCoverage(coverage, insuranceType)) {
      throw new BadRequestException(
        `coverage '${coverage}' no es válida para el tipo de seguro '${insuranceType}'`,
      );
    }

    if (!this.catalogsService.isValidLocation(location)) {
      throw new BadRequestException(
        `location '${location}' no es válida. Consulte GET /catalogs/locations para valores permitidos`,
      );
    }

    const { estimatedPremium, breakdown } = this.calculatePremium(
      insuranceType,
      coverage,
      age,
      location,
    );

    const quote = await this.prisma.quote.create({
      data: {
        insuranceType,
        coverage,
        age,
        location,
        estimatedPremium,
        breakdown: breakdown as object[],
      },
    });

    this.logger.log(`Quote created: ${quote.id} - Premium: ${estimatedPremium}`);

    return this.formatQuote(quote, breakdown);
  }

  async getQuoteById(id: string) {
    this.logger.log(`Fetching quote: ${id}`);
    const quote = await this.prisma.quote.findUnique({ where: { id } });

    if (!quote) {
      throw new NotFoundException(`Cotización con id '${id}' no encontrada`);
    }

    return this.formatQuote(quote, (quote.breakdown as unknown) as BreakdownItem[]);
  }

  private calculatePremium(
    insuranceType: string,
    coverage: string,
    age: number,
    location: string,
  ): { estimatedPremium: number; breakdown: BreakdownItem[] } {
    const base = BASE_PREMIUMS[insuranceType] || 100;
    const ageFactor = this.getAgeFactor(age);
    const locationFactor = LOCATION_FACTORS[location] ?? 25;
    const coverageFactor = COVERAGE_FACTORS[coverage] ?? 0;

    const estimatedPremium = base + ageFactor + locationFactor + coverageFactor;

    const breakdown: BreakdownItem[] = [
      { concept: 'BASE', amount: base },
      { concept: 'AGE_FACTOR', amount: ageFactor },
      { concept: 'LOCATION_FACTOR', amount: locationFactor },
      { concept: 'COVERAGE_FACTOR', amount: coverageFactor },
    ];

    return { estimatedPremium, breakdown };
  }

  // Función escalonada: menores de 25 tienen mayor tasa de siniestros;
  // mayores de 60, mayor riesgo de salud. Valores simplificados para el MVP.
  private getAgeFactor(age: number): number {
    if (age < 25) return 50;
    if (age <= 40) return 60;
    if (age <= 60) return 80;
    return 100;
  }

  private formatQuote(quote: any, breakdown: BreakdownItem[]) {
    return {
      id: quote.id,
      status: quote.status,
      inputs: {
        insuranceType: quote.insuranceType,
        coverage: quote.coverage,
        age: quote.age,
        location: quote.location,
      },
      estimatedPremium: quote.estimatedPremium,
      breakdown,
      createdAt: quote.createdAt,
    };
  }
}
