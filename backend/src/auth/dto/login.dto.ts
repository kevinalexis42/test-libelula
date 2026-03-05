import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email del usuario' })
  @IsEmail({}, { message: 'El email debe ser válido' })
  email: string;

  @ApiProperty({ example: 'Password123!', description: 'Contraseña del usuario' })
  @IsString({ message: 'La contraseña debe ser un texto' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;
}
