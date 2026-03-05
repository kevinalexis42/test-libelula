import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreatePolicyDto {
  @ApiProperty({
    description: 'UUID de la cotización a emitir como póliza',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4', { message: 'quoteId debe ser un UUID válido' })
  quoteId: string;
}
