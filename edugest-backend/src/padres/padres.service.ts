import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePadreDto } from './dto/create-padre.dto';
import { UpdatePadreDto } from './dto/update-padre.dto';

@Injectable()
export class PadresService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePadreDto) {
    return this.prisma.db.padreFamilia.create({ data: dto });
  }

  async findAll() {
    return this.prisma.db.padreFamilia.findMany({
      include: {
        estudiantes: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            isActive: true,
          },
        },
      },
      orderBy: { apellido: 'asc' },
    });
  }

  async findOne(id: string) {
    const padre = await this.prisma.db.padreFamilia.findUnique({
      where: { id },
      include: { estudiantes: true },
    });

    if (!padre) {
      throw new NotFoundException(`Padre de familia con id ${id} no encontrado.`);
    }

    return padre;
  }

  async update(id: string, dto: UpdatePadreDto) {
    await this.findOne(id);

    return this.prisma.db.padreFamilia.update({
      where: { id },
      data: dto,
    });
  }
}