// src/auth/auth.service.ts
import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(data: Prisma.UsuarioCreateInput) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    try {
      const newUser = await this.prisma.db.usuario.create({
        data: {
          ...data,
          password: hashedPassword,
        },
      });

      const { password, ...result } = newUser;
      return result;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(
          'El correo electrónico o la Cédula de Identidad (CI) ya se encuentran registrados.',
        );
      }
      throw error;
    }
  }

  async login(loginDto: any) {
    const { email, password } = loginDto;

    const user = await this.prisma.db.usuario.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas.');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('El usuario se encuentra inactivo.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales incorrectas.');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        ci: user.ci,
        role: user.role,
      },
    };
  }
}