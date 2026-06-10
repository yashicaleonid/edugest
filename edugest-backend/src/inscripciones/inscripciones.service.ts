import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInscripcionDto } from './dto/create-inscripcion.dto';
import { UpdateInscripcionDto } from './dto/update-inscripcion.dto';

@Injectable()
export class InscripcionesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateInscripcionDto) {
    // Verificar que no esté ya inscrito en el mismo curso y gestión
    const existe = await this.prisma.db.inscripcion.findFirst({
      where: {
        estudianteId: dto.estudianteId,
        cursoId: dto.cursoId,
        gestion: dto.gestion,
      },
    });

    if (existe) {
      throw new ConflictException('El estudiante ya está inscrito en este curso para esta gestión.');
    }

    return this.prisma.db.inscripcion.create({
      data: dto,
      include: {
        estudiante: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            ci: true,
          },
        },
        curso: {
          select: {
            id: true,
            nombre: true,
            nivel: true,
            paralelo: true,
            gestion: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.db.inscripcion.findMany({
      include: {
        estudiante: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            ci: true,
          },
        },
        curso: {
          select: {
            id: true,
            nombre: true,
            nivel: true,
            paralelo: true,
            gestion: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const inscripcion = await this.prisma.db.inscripcion.findUnique({
      where: { id },
      include: {
        estudiante: true,
        curso: {
          include: {
            docente: {
              include: {
                usuario: {
                  select: { nombre: true, apellido: true },
                },
              },
            },
          },
        },
        pagos: true,
        asistencias: true,
      },
    });

    if (!inscripcion) {
      throw new NotFoundException(`Inscripción con id ${id} no encontrada.`);
    }

    return inscripcion;
  }

  async update(id: string, dto: UpdateInscripcionDto) {
    await this.findOne(id);

    return this.prisma.db.inscripcion.update({
      where: { id },
      data: dto,
      include: {
        estudiante: {
          select: { nombre: true, apellido: true },
        },
        curso: {
          select: { nombre: true, nivel: true, paralelo: true },
        },
      },
    });
  }
}