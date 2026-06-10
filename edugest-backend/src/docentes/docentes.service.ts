import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocenteDto } from './dto/create-docente.dto';
import { UpdateDocenteDto } from './dto/update-docente.dto';

@Injectable()
export class DocentesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDocenteDto) {
    // Verificar que el usuario existe y tiene rol DOCENTE
    const usuario = await this.prisma.db.usuario.findUnique({
      where: { id: dto.usuarioId },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con id ${dto.usuarioId} no encontrado.`);
    }

    if (usuario.role !== 'DOCENTE') {
      throw new ConflictException('El usuario debe tener el rol DOCENTE.');
    }

    // Verificar que no tenga ya un perfil de docente
    const existe = await this.prisma.db.docente.findUnique({
      where: { usuarioId: dto.usuarioId },
    });

    if (existe) {
      throw new ConflictException('Este usuario ya tiene un perfil de docente.');
    }

    return this.prisma.db.docente.create({
      data: dto,
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            ci: true,
            role: true,
            isActive: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.db.docente.findMany({
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            ci: true,
            isActive: true,
          },
        },
        cursos: {
          select: {
            id: true,
            nombre: true,
            nivel: true,
            paralelo: true,
            gestion: true,
          },
        },
      },
      orderBy: {
        usuario: { apellido: 'asc' },
      },
    });
  }

  async findOne(id: string) {
    const docente = await this.prisma.db.docente.findUnique({
      where: { id },
      include: {
        usuario: true,
        cursos: true,
      },
    });

    if (!docente) {
      throw new NotFoundException(`Docente con id ${id} no encontrado.`);
    }

    return docente;
  }

  async update(id: string, dto: UpdateDocenteDto) {
    await this.findOne(id);

    return this.prisma.db.docente.update({
      where: { id },
      data: dto,
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
          },
        },
      },
    });
  }
}