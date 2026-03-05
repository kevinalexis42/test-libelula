import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PoliciesService } from './policies.service';
import { CreatePolicyDto } from './dto/create-policy.dto';

interface AuthenticatedRequest extends Request {
  user: { id: string; email: string };
}

@ApiTags('Policies')
@Controller('policies')
export class PoliciesController {
  constructor(private readonly policiesService: PoliciesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Emitir póliza',
    description:
      'Emite una póliza a partir de una cotización existente. Requiere autenticación JWT. ' +
      'No permite doble emisión por cotización.',
  })
  @ApiBody({ type: CreatePolicyDto })
  @ApiResponse({
    status: 201,
    description: 'Póliza emitida exitosamente',
    schema: {
      example: {
        id: 'uuid',
        quoteId: 'uuid',
        status: 'ACTIVE',
        issuedAt: '2026-03-05T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado - Token JWT requerido' })
  @ApiResponse({ status: 404, description: 'Cotización no encontrada' })
  @ApiResponse({ status: 409, description: 'Ya existe una póliza para esta cotización' })
  createPolicy(
    @Body() createPolicyDto: CreatePolicyDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.policiesService.createPolicy(createPolicyDto, req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Obtener póliza por ID',
    description: 'Retorna la póliza persistida por su identificador. Requiere autenticación JWT.',
  })
  @ApiParam({ name: 'id', description: 'UUID de la póliza', example: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Póliza encontrada',
    schema: {
      example: {
        id: 'uuid',
        quoteId: 'uuid',
        status: 'ACTIVE',
        issuedAt: '2026-03-05T00:00:00.000Z',
        quote: {
          insuranceType: 'AUTO',
          coverage: 'PREMIUM',
          age: 35,
          location: 'EC-AZUAY',
          estimatedPremium: 350,
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado - Token JWT requerido' })
  @ApiResponse({ status: 404, description: 'Póliza no encontrada' })
  getPolicyById(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.policiesService.getPolicyById(id, req.user.id);
  }
}
