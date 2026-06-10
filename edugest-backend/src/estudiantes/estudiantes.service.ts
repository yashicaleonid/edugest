import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEstudianteDto } from './dto/create-estudiante.dto';
import { UpdateEstudianteDto } from './dto/update-estudiante.dto';

@Injectable()
export class EstudiantesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEstudianteDto) {
    return this.prisma.db.estudiante.create({
      data: {
        ...dto,
        fechaNac: new Date(dto.fechaNac),
      },
      include: { padre: true },
    });
  }

  async findAll() {
    return this.prisma.db.estudiante.findMany({
      include: {
        padre: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            telefono: true,
            email: true,
          },
        },
      },
      orderBy: { apellido: 'asc' },
    });
  }

  async findOne(id: string) {
    const estudiante = await this.prisma.db.estudiante.findUnique({
      where: { id },
      include: {
        padre: true,
        inscripciones: {
          include: { curso: true },
        },
      },
    });

    if (!estudiante) {
      throw new NotFoundException(`Estudiante con id ${id} no encontrado.`);
    }

    return estudiante;
  }

  async update(id: string, dto: UpdateEstudianteDto) {
    await this.findOne(id);

    return this.prisma.db.estudiante.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.fechaNac && { fechaNac: new Date(dto.fechaNac) }),
      },
      include: { padre: true },
    });
  }

  async deactivate(id: string) {
    await this.findOne(id);

    return this.prisma.db.estudiante.update({
      where: { id },
      data: { isActive: false },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        isActive: true,
      },
    });
  }
}