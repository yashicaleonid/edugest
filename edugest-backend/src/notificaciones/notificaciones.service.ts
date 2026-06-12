import { Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificacionDto } from './dto/create-notificacion.dto';

@Injectable()
export class NotificacionesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateNotificacionDto) {
    const usuario = await this.prisma.db.usuario.findUnique({
      where: { id: dto.usuarioId },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con id ${dto.usuarioId} no encontrado.`);
    }

    return this.prisma.db.notificacion.create({
      data: dto,
      include: {
        usuario: {
          select: { nombre: true, apellido: true, email: true },
        },
      },
    });
  }

  async findByUsuario(usuarioId: string) {
    return this.prisma.db.notificacion.findMany({
      where: { usuarioId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findNoLeidas(usuarioId: string) {
    return this.prisma.db.notificacion.findMany({
      where: { usuarioId, leido: false },
      orderBy: { createdAt: 'desc' },
    });
  }

  async marcarLeida(id: string) {
    const notificacion = await this.prisma.db.notificacion.findUnique({
      where: { id },
    });

    if (!notificacion) {
      throw new NotFoundException(`Notificación con id ${id} no encontrada.`);
    }

    return this.prisma.db.notificacion.update({
      where: { id },
      data: { leido: true },
    });
  }

  async marcarTodasLeidas(usuarioId: string) {
    const result = await this.prisma.db.notificacion.updateMany({
      where: { usuarioId, leido: false },
      data: { leido: true },
    });

    return {
      message: `${result.count} notificaciones marcadas como leídas.`,
      total: result.count,
    };
  }

  async notificarUsuario(usuarioId: string, titulo: string, mensaje: string) {
    return this.prisma.db.notificacion.create({
      data: { usuarioId, titulo, mensaje },
    });
  }

  async notificarPorRoles(roles: Role[], titulo: string, mensaje: string) {
    const usuarios = await this.prisma.db.usuario.findMany({
      where: { role: { in: roles }, isActive: true },
      select: { id: true },
    });

    if (usuarios.length === 0) return;

    await this.prisma.db.notificacion.createMany({
      data: usuarios.map((u) => ({ usuarioId: u.id, titulo, mensaje })),
    });
  }
}