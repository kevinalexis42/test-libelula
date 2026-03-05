import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { CatalogsService } from './catalogs.service';

@ApiTags('Catalogs')
@Controller('catalogs')
export class CatalogsController {
  constructor(private readonly catalogsService: CatalogsService) {}

  @Get('insurance-types')
  @ApiOperation({
    summary: 'Listar tipos de seguro',
    description: 'Retorna los tipos de seguro disponibles: AUTO, SALUD, HOGAR.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de tipos de seguro',
    schema: {
      example: {
        items: [
          { code: 'AUTO', name: 'Seguro de Auto' },
          { code: 'SALUD', name: 'Seguro de Salud' },
          { code: 'HOGAR', name: 'Seguro de Hogar' },
        ],
      },
    },
  })
  getInsuranceTypes() {
    return this.catalogsService.getInsuranceTypes();
  }

  @Get('coverages')
  @ApiOperation({
    summary: 'Listar coberturas',
    description:
      'Retorna las coberturas disponibles. Si se pasa insuranceType, filtra por tipo de seguro.',
  })
  @ApiQuery({
    name: 'insuranceType',
    required: false,
    description: 'Filtrar por tipo de seguro (AUTO, SALUD, HOGAR)',
    example: 'AUTO',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de coberturas',
    schema: {
      example: {
        items: [
          { code: 'BASICA', name: 'Cobertura Básica' },
          { code: 'ESTANDAR', name: 'Cobertura Estándar' },
          { code: 'PREMIUM', name: 'Cobertura Premium' },
        ],
      },
    },
  })
  getCoverages(@Query('insuranceType') insuranceType?: string) {
    return this.catalogsService.getCoverages(insuranceType);
  }

  @Get('locations')
  @ApiOperation({
    summary: 'Listar ubicaciones',
    description: 'Retorna las provincias/ubicaciones disponibles del Ecuador.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de ubicaciones',
    schema: {
      example: {
        items: [
          { code: 'EC-PICHINCHA', name: 'Pichincha' },
          { code: 'EC-GUAYAS', name: 'Guayas' },
          { code: 'EC-AZUAY', name: 'Azuay' },
        ],
      },
    },
  })
  getLocations() {
    return this.catalogsService.getLocations();
  }
}
