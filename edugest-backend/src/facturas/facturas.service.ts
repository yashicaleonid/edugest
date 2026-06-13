import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { CucuService } from './cucu.service';

@Injectable()
export class FacturasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly cucu: CucuService,
  ) {}

  async emitir(pagoId: string) {
    const pago = await this.prisma.db.pago.findUnique({
      where: { id: pagoId },
      include: {
        inscripcion: {
          include: {
            estudiante: { include: { padre: true } },
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

    const padre = pago.inscripcion.estudiante.padre;
    const emision = await this.cucu.emitirFactura({
      monto: Number(pago.monto),
      metodoPago: pago.metodoPago,
      nombreCliente: padre ? `${padre.nombre} ${padre.apellido}` : `${pago.inscripcion.estudiante.nombre} ${pago.inscripcion.estudiante.apellido}`,
      ciCliente: padre?.ci || pago.inscripcion.estudiante.ci,
      descripcion: `Pago ${pago.mes} ${pago.gestion} - ${pago.inscripcion.curso.nombre}`,
    });

    const factura = await this.prisma.db.factura.create({
      data: {
        pagoId,
        cuf: emision.cuf,
        nroFactura: emision.nroFactura,
        estado: emision.estado,
        pdfUrl: emision.pdfUrl,
        fechaEmision: new Date(),
      },
      include: {
        pago: {
          include: {
            inscripcion: {
              include: { estudiante: true, curso: true },
            },
            cajero: { select: { nombre: true, apellido: true } },
          },
        },
      },
    });

    if (padre?.email) {
      await this.mail.enviarFactura({
        email: padre.email,
        nombreCliente: `${padre.nombre} ${padre.apellido}`,
        cuf: factura.cuf,
        nroFactura: factura.nroFactura,
        monto: Number(pago.monto),
        pdfUrl: factura.pdfUrl || undefined,
      });
    }

    return factura;
  }

  async findAll() {
    return this.prisma.db.factura.findMany({
      include: {
        pago: {
          include: {
            inscripcion: {
              include: {
                estudiante: { select: { nombre: true, apellido: true, ci: true } },
                curso: { select: { nombre: true, paralelo: true } },
              },
            },
            cajero: { select: { nombre: true, apellido: true } },
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
                estudiante: { include: { padre: true } },
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

  async consultarEstado(id: string) {
    const factura = await this.findOne(id);
    const estadoCucu = await this.cucu.consultarEstado(factura.cuf);

    if (estadoCucu.estado !== factura.estado) {
      return this.prisma.db.factura.update({
        where: { id },
        data: { estado: estadoCucu.estado },
      });
    }

    return factura;
  }

  async validarSin(id: string) {
    const factura = await this.findOne(id);
    return this.cucu.validarAnteSin(factura.cuf);
  }

  async reenviarCorreo(id: string) {
    const factura = await this.findOne(id);
    const padre = factura.pago.inscripcion.estudiante.padre;

    if (!padre?.email) {
      throw new NotFoundException('El padre de familia no tiene correo registrado.');
    }

    await this.mail.enviarFactura({
      email: padre.email,
      nombreCliente: `${padre.nombre} ${padre.apellido}`,
      cuf: factura.cuf,
      nroFactura: factura.nroFactura,
      monto: Number(factura.pago.monto),
      pdfUrl: factura.pdfUrl || undefined,
    });

    return { message: 'Factura reenviada por correo exitosamente.' };
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

  async descargarPdf(id: string): Promise<{ url: string; nroFactura: number }> {
  const factura = await this.findOne(id);

  if (!factura.pdfUrl) {
    throw new NotFoundException('Esta factura no tiene PDF disponible.');
  }

  return {
    url: factura.pdfUrl,
    nroFactura: factura.nroFactura,
  };
}
}
