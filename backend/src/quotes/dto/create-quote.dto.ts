import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsString, Min, Max } from 'class-validator';

export enum InsuranceType {
  AUTO = 'AUTO',
  SALUD = 'SALUD',
  HOGAR = 'HOGAR',
}

export enum CoverageType {
  BASICA = 'BASICA',
  ESTANDAR = 'ESTANDAR',
  PREMIUM = 'PREMIUM',
}

export class CreateQuoteDto {
  @ApiProperty({
    enum: InsuranceType,
    description: 'Tipo de seguro',
    example: 'AUTO',
  })
  @IsEnum(InsuranceType, {
    message: 'insuranceType debe ser uno de: AUTO, SALUD, HOGAR',
  })
  insuranceType: InsuranceType;

  @ApiProperty({
    enum: CoverageType,
    description: 'Tipo de cobertura',
    example: 'PREMIUM',
  })
  @IsEnum(CoverageType, {
    message: 'coverage debe ser uno de: BASICA, ESTANDAR, PREMIUM',
  })
  coverage: CoverageType;

  @ApiProperty({
    description: 'Edad del asegurado (18-100)',
    minimum: 18,
    maximum: 100,
    example: 35,
  })
  @IsInt({ message: 'age debe ser un número entero' })
  @Min(18, { message: 'La edad mínima es 18 años' })
  @Max(100, { message: 'La edad máxima es 100 años' })
  age: number;

  @ApiProperty({
    description: 'Código de ubicación (provincia del Ecuador)',
    example: 'EC-AZUAY',
  })
  @IsString({ message: 'location debe ser un texto' })
  location: string;
}
