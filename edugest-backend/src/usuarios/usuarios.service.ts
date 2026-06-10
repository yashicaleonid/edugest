import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.db.usuario.findMany({
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
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const usuario = await this.prisma.db.usuario.findUnique({
      where: { id },
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

    if (!usuario) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado.`);
    }

    return usuario;
  }

  async update(id: string, dto: UpdateUsuarioDto) {
    await this.findOne(id); // verifica que existe

    return this.prisma.db.usuario.update({
      where: { id },
      data: dto,
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        ci: true,
        role: true,
        isActive: true,
      },
    });
  }

  async deactivate(id: string) {
    await this.findOne(id); // verifica que existe

    return this.prisma.db.usuario.update({
      where: { id },
      data: { isActive: false },
      select: {
        id: true,
        email: true,
        nombre: true,
        isActive: true,
      },
    });
  }
}