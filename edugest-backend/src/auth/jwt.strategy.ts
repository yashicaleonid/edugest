// src/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      // Extrae el token JWT del header 'Authorization: Bearer <TOKEN>'
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'secretKeyPorDefecto',
    });
  }

  /**
   * Este método valida automáticamente el contenido (payload) del token 
   * en cada petición HTTP que requiera seguridad.
   */
  async validate(payload: { sub: string; email: string }) {
    // Buscar si el usuario que viene en el token realmente existe en PostgreSQL
    const user = await this.prisma.db.usuario.findUnique({
  where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no registrado en el sistema.');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('El usuario se encuentra inactivo. Contacte soporte.');
    }

    // Lo que retornes aquí se inyectará automáticamente en 'req.user'
    return { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    };
  }
}