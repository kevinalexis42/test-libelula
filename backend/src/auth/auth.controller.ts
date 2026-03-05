import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Autenticación de usuario',
    description: 'Retorna un token JWT para usar en endpoints protegidos.',
  })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        tokenType: 'Bearer',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales inválidas',
    schema: {
      example: {
        type: 'https://httpstatuses.com/401',
        title: 'Unauthorized',
        status: 401,
        detail: 'Credenciales inválidas',
        instance: '/auth/login',
      },
    },
  })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
