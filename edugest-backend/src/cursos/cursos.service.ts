import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCursoDto } from './dto/create-curso.dto';
import { UpdateCursoDto } from './dto/update-curso.dto';

@Injectable()
export class CursosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCursoDto) {
    return this.prisma.db.curso.create({
      data: dto,
      include: {
        docente: {
          include: {
            usuario: {
              select: {
                nombre: true,
                apellido: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.db.curso.findMany({
      include: {
        docente: {
          include: {
            usuario: {
              select: {
                nombre: true,
                apellido: true,
              },
            },
          },
        },
        _count: {
          select: { inscripciones: true },
        },
      },
      orderBy: [{ gestion: 'desc' }, { nombre: 'asc' }],
    });
  }

  async findOne(id: string) {
    const curso = await this.prisma.db.curso.findUnique({
      where: { id },
      include: {
        docente: {
          include: {
            usuario: {
              select: {
                nombre: true,
                apellido: true,
                email: true,
              },
            },
          },
        },
        inscripciones: {
          include: {
            estudiante: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                ci: true,
              },
            },
          },
        },
      },
    });

    if (!curso) {
      throw new NotFoundException(`Curso con id ${id} no encontrado.`);
    }

    return curso;
  }

  async update(id: string, dto: UpdateCursoDto) {
    await this.findOne(id);

    return this.prisma.db.curso.update({
      where: { id },
      data: dto,
      include: {
        docente: {
          include: {
            usuario: {
              select: { nombre: true, apellido: true },
            },
          },
        },
      },
    });
  }
}