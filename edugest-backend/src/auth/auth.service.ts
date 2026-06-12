// src/auth/auth.service.ts
import { Injectable, ConflictException, UnauthorizedException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcrypt';
import { Prisma, Role } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mail: MailService,
  ) {}

  async registerWithAuth(data: Prisma.UsuarioCreateInput, requesterRole?: Role) {
    const userCount = await this.prisma.db.usuario.count();

    if (userCount > 0) {
      const rolesPermitidos: Role[] = [Role.ADMINISTRADOR, Role.DIRECTOR];
      if (!requesterRole || !rolesPermitidos.includes(requesterRole)) {
        throw new ForbiddenException('Solo administradores y directores pueden registrar usuarios.');
      }
    }

    return this.register(data);
  }

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

      const { password, resetToken, resetTokenExpiry, ...result } = newUser;
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

  async getProfile(userId: string) {
    const user = await this.prisma.db.usuario.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        ci: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    return user;
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.db.usuario.findUnique({ where: { email } });

    if (!user) {
      return { message: 'Si el correo existe, recibirá instrucciones para restablecer su contraseña.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000);

    await this.prisma.db.usuario.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry },
    });

    await this.mail.enviarRecuperacionPassword({
      email: user.email,
      nombre: `${user.nombre} ${user.apellido}`,
      resetToken,
    });

    return { message: 'Si el correo existe, recibirá instrucciones para restablecer su contraseña.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.db.usuario.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Token inválido o expirado.');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await this.prisma.db.usuario.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return { message: 'Contraseña restablecida exitosamente.' };
  }
}