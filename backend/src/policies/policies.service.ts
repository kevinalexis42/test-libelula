import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePolicyDto } from './dto/create-policy.dto';

@Injectable()
export class PoliciesService {
  private readonly logger = new Logger(PoliciesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createPolicy(dto: CreatePolicyDto, userId: string) {
    const { quoteId } = dto;
    this.logger.log(`Emitting policy for quoteId: ${quoteId} by userId: ${userId}`);

    // Verify quote exists
    const quote = await this.prisma.quote.findUnique({ where: { id: quoteId } });
    if (!quote) {
      throw new NotFoundException(`Cotización con id '${quoteId}' no encontrada`);
    }

    // Check for double emission (unique constraint on quoteId)
    const existingPolicy = await this.prisma.policy.findUnique({
      where: { quoteId },
    });

    if (existingPolicy) {
      throw new ConflictException(
        `Ya existe una póliza emitida para la cotización '${quoteId}'. No se permite doble emisión.`,
      );
    }

    const policy = await this.prisma.policy.create({
      data: {
        quoteId,
        userId,
        status: 'ACTIVE',
      },
    });

    // Update quote status to BOUND
    await this.prisma.quote.update({
      where: { id: quoteId },
      data: { status: 'BOUND' },
    });

    this.logger.log(`Policy emitted: ${policy.id} for quote: ${quoteId}`);

    return {
      id: policy.id,
      quoteId: policy.quoteId,
      status: policy.status,
      issuedAt: policy.issuedAt,
    };
  }

  async getPolicyById(id: string, userId: string) {
    this.logger.log(`Fetching policy: ${id} for userId: ${userId}`);

    const policy = await this.prisma.policy.findUnique({
      where: { id },
      include: {
        quote: {
          select: {
            insuranceType: true,
            coverage: true,
            age: true,
            location: true,
            estimatedPremium: true,
          },
        },
      },
    });

    if (!policy) {
      throw new NotFoundException(`Póliza con id '${id}' no encontrada`);
    }

    return {
      id: policy.id,
      quoteId: policy.quoteId,
      status: policy.status,
      issuedAt: policy.issuedAt,
      quote: policy.quote,
    };
  }
}
