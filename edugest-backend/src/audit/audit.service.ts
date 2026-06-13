import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filtros?: { usuarioId?: string; modulo?: string }) {
    return this.prisma.db.auditLog.findMany({
      where: {
        ...(filtros?.usuarioId && { usuarioId: filtros.usuarioId }),
        ...(filtros?.modulo && { modulo: filtros.modulo }),
      },
      include: {
        usuario: { select: { nombre: true, apellido: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  async findByUsuario(usuarioId: string) {
    return this.prisma.db.auditLog.findMany({
      where: { usuarioId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}