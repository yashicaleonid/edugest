import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FacturasService {
  constructor(private readonly prisma: PrismaService) {}

  private generarCUF(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `CUF-${timestamp}-${random}`;
  }

  private generarNroFactura(): number {
    return Math.floor(Math.random() * 900000) + 100000;
  }

  async emitir(pagoId: string) {
    // Verificar que el pago existe
    const pago = await this.prisma.db.pago.findUnique({
      where: { id: pagoId },
      include: {
        inscripcion: {
          include: {
            estudiante: {
              include: { padre: true },
            },
            curso: true,
          },
        },
        cajero: true,
        factura: true,
      },
    });

    if (!pago) {
      throw new NotFoundException(`Pago con id ${pagoId} no encontrado.`);
    }

    if (pago.factura) {
      throw new ConflictException('Este pago ya tiene una factura emitida.');
    }

    // Simular llamada a API CUCU
    const cuf = this.generarCUF();
    const nroFactura = this.generarNroFactura();

    // Crear factura en BD
    const factura = await this.prisma.db.factura.create({
      data: {
        pagoId,
        cuf,
        nroFactura,
        estado: 'EMITIDA',
        fechaEmision: new Date(),
      },
      include: {
        pago: {
          include: {
            inscripcion: {
              include: {
                estudiante: true,
                curso: true,
              },
            },
            cajero: {
              select: { nombre: true, apellido: true },
            },
          },
        },
      },
    });

    return factura;
  }

  async findAll() {
    return this.prisma.db.factura.findMany({
      include: {
        pago: {
          include: {
            inscripcion: {
              include: {
                estudiante: {
                  select: { nombre: true, apellido: true, ci: true },
                },
                curso: {
                  select: { nombre: true, paralelo: true },
                },
              },
            },
            cajero: {
              select: { nombre: true, apellido: true },
            },
          },
        },
      },
      orderBy: { fechaEmision: 'desc' },
    });
  }

  async findOne(id: string) {
    const factura = await this.prisma.db.factura.findUnique({
      where: { id },
      include: {
        pago: {
          include: {
            inscripcion: {
              include: {
                estudiante: {
                  include: { padre: true },
                },
                curso: true,
              },
            },
            cajero: true,
          },
        },
      },
    });

    if (!factura) {
      throw new NotFoundException(`Factura con id ${id} no encontrada.`);
    }

    return factura;
  }

  async anular(id: string) {
    const factura = await this.findOne(id);

    if (factura.estado === 'ANULADA') {
      throw new ConflictException('La factura ya está anulada.');
    }

    return this.prisma.db.factura.update({
      where: { id },
      data: { estado: 'ANULADA' },
    });
  }
}