import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePagoDto } from './dto/create-pago.dto';

@Injectable()
export class PagosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePagoDto) {
    // Verificar que la inscripción existe
    const inscripcion = await this.prisma.db.inscripcion.findUnique({
      where: { id: dto.inscripcionId },
      include: {
        estudiante: {
          select: { nombre: true, apellido: true },
        },
      },
    });

    if (!inscripcion) {
      throw new NotFoundException(`Inscripción con id ${dto.inscripcionId} no encontrada.`);
    }

    // Verificar que no exista ya un pago para ese mes y gestión
    const pagoExiste = await this.prisma.db.pago.findFirst({
      where: {
        inscripcionId: dto.inscripcionId,
        mes: dto.mes,
        gestion: dto.gestion,
      },
    });

    if (pagoExiste) {
      throw new ConflictException(
        `Ya existe un pago registrado para ${dto.mes} de ${dto.gestion}.`,
      );
    }

    // Verificar que el cajero existe
    const cajero = await this.prisma.db.usuario.findUnique({
      where: { id: dto.cajeroId },
    });

    if (!cajero) {
      throw new NotFoundException(`Cajero con id ${dto.cajeroId} no encontrado.`);
    }

    return this.prisma.db.pago.create({
      data: {
        inscripcionId: dto.inscripcionId,
        cajeroId: dto.cajeroId,
        monto: dto.monto,
        metodoPago: dto.metodoPago,
        mes: dto.mes,
        gestion: dto.gestion,
      },
      include: {
        inscripcion: {
          include: {
            estudiante: {
              select: { nombre: true, apellido: true, ci: true },
            },
            curso: {
              select: { nombre: true, nivel: true, paralelo: true },
            },
          },
        },
        cajero: {
          select: { nombre: true, apellido: true, role: true },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.db.pago.findMany({
      include: {
        inscripcion: {
          include: {
            estudiante: {
              select: { nombre: true, apellido: true, ci: true },
            },
            curso: {
              select: { nombre: true, nivel: true, paralelo: true },
            },
          },
        },
        cajero: {
          select: { nombre: true, apellido: true },
        },
        factura: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const pago = await this.prisma.db.pago.findUnique({
      where: { id },
      include: {
        inscripcion: {
          include: {
            estudiante: true,
            curso: true,
          },
        },
        cajero: {
          select: { nombre: true, apellido: true, email: true },
        },
        factura: true,
      },
    });

    if (!pago) {
      throw new NotFoundException(`Pago con id ${id} no encontrado.`);
    }

    return pago;
  }

  async findByInscripcion(inscripcionId: string) {
    return this.prisma.db.pago.findMany({
      where: { inscripcionId },
      include: {
        factura: true,
        cajero: {
          select: { nombre: true, apellido: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}