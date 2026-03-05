import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: Error, user: unknown) {
    if (err || !user) {
      throw new UnauthorizedException(
        'Acceso no autorizado. Proporcione un token JWT válido en el header Authorization: Bearer <token>',
      );
    }
    return user;
  }
}
