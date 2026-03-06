import { Controller, Post, Get, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse, ApiBody } from '@nestjs/swagger';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dto/create-quote.dto';

type QuoteResponse = Promise<{
  id: string;
  status: string;
  inputs: { insuranceType: string; coverage: string; age: number; location: string };
  estimatedPremium: number;
  breakdown: { concept: string; amount: number }[];
  createdAt: Date;
}>;

@ApiTags('Quotes')
@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear cotización',
    description:
      'Crea una nueva cotización de seguro. Calcula la prima estimada y devuelve un desglose del cálculo.',
  })
  @ApiBody({ type: CreateQuoteDto })
  @ApiResponse({
    status: 201,
    description: 'Cotización creada exitosamente',
    schema: {
      example: {
        id: 'uuid',
        status: 'QUOTED',
        inputs: {
          insuranceType: 'AUTO',
          coverage: 'PREMIUM',
          age: 35,
          location: 'EC-AZUAY',
        },
        estimatedPremium: 350,
        breakdown: [
          { concept: 'BASE', amount: 200 },
          { concept: 'AGE_FACTOR', amount: 60 },
          { concept: 'LOCATION_FACTOR', amount: 40 },
          { concept: 'COVERAGE_FACTOR', amount: 50 },
        ],
        createdAt: '2026-03-05T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o valores fuera de catálogo',
  })
  createQuote(@Body() createQuoteDto: CreateQuoteDto): QuoteResponse {
    return this.quotesService.createQuote(createQuoteDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener cotización por ID',
    description: 'Retorna la cotización persistida por su identificador único.',
  })
  @ApiParam({ name: 'id', description: 'UUID de la cotización', example: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Cotización encontrada',
  })
  @ApiResponse({
    status: 404,
    description: 'Cotización no encontrada',
  })
  getQuoteById(@Param('id') id: string): QuoteResponse {
    return this.quotesService.getQuoteById(id);
  }
}
