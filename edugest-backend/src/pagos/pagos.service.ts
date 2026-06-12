import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { CreatePagoDto } from './dto/create-pago.dto';

@Injectable()
export class PagosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  async create(dto: CreatePagoDto) {
    const inscripcion = await this.prisma.db.inscripcion.findUnique({
      where: { id: dto.inscripcionId },
      include: {
        estudiante: { include: { padre: true } },
        curso: { select: { nombre: true, paralelo: true } },
      },
    });
    if (!inscripcion) throw new NotFoundException(`Inscripcion con id ${dto.inscripcionId} no encontrada.`);

    const pagoExiste = await this.prisma.db.pago.findFirst({
      where: { inscripcionId: dto.inscripcionId, mes: dto.mes, gestion: dto.gestion },
    });
    if (pagoExiste) throw new ConflictException(`Ya existe un pago registrado para ${dto.mes} de ${dto.gestion}.`);

    const cajero = await this.prisma.db.usuario.findUnique({ where: { id: dto.cajeroId } });
    if (!cajero) throw new NotFoundException(`Cajero con id ${dto.cajeroId} no encontrado.`);

    const pago = await this.prisma.db.pago.create({
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
            estudiante: { select: { nombre: true, apellido: true, ci: true } },
            curso: { select: { nombre: true, nivel: true, paralelo: true } },
          },
        },
        cajero: { select: { nombre: true, apellido: true, role: true } },
      },
    });

    // Enviar correo al padre si tiene email
    if (inscripcion.estudiante?.padre?.email) {
      await this.mail.enviarConfirmacionPago({
        emailPadre: inscripcion.estudiante.padre.email,
        nombrePadre: `${inscripcion.estudiante.padre.nombre} ${inscripcion.estudiante.padre.apellido}`,
        nombreEstudiante: inscripcion.estudiante.nombre,
        apellidoEstudiante: inscripcion.estudiante.apellido,
        curso: `${inscripcion.curso.nombre} ${inscripcion.curso.paralelo}`,
        mes: dto.mes,
        gestion: dto.gestion,
        monto: dto.monto,
        metodoPago: dto.metodoPago,
        cajero: `${cajero.nombre} ${cajero.apellido}`,
      });
    }

    return pago;
  }

  async findAll() {
    return this.prisma.db.pago.findMany({
      include: {
        inscripcion: {
          include: {
            estudiante: { select: { nombre: true, apellido: true, ci: true } },
            curso: { select: { nombre: true, nivel: true, paralelo: true } },
          },
        },
        cajero: { select: { nombre: true, apellido: true } },
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
            estudiante: { include: { padre: true } },
            curso: true,
          },
        },
        cajero: { select: { nombre: true, apellido: true, email: true } },
        factura: true,
      },
    });
    if (!pago) throw new NotFoundException(`Pago con id ${id} no encontrado.`);
    return pago;
  }

  async findByInscripcion(inscripcionId: string) {
    return this.prisma.db.pago.findMany({
      where: { inscripcionId },
      include: { factura: true, cajero: { select: { nombre: true, apellido: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getDeudas(gestion: number) {
    const MESES = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ];
    const mesActual = new Date().getMonth();

    const inscripciones = await this.prisma.db.inscripcion.findMany({
      where: { gestion, estado: 'ACTIVO' },
      include: {
        estudiante: { include: { padre: true } },
        curso: { select: { nombre: true, paralelo: true } },
        pagos: { select: { mes: true } },
      },
    });

    return inscripciones
      .map((inscripcion) => {
        const mesesPagados = inscripcion.pagos.map((p) => p.mes);
        const mesesPendientes = MESES.slice(0, mesActual + 1).filter(
          (mes) => !mesesPagados.includes(mes),
        );
        if (mesesPendientes.length === 0) return null;
        return {
          inscripcionId: inscripcion.id,
          estudiante: `${inscripcion.estudiante.nombre} ${inscripcion.estudiante.apellido}`,
          curso: `${inscripcion.curso.nombre} ${inscripcion.curso.paralelo}`,
          padre: inscripcion.estudiante.padre?.email,
          mesesPendientes,
        };
      })
      .filter(Boolean);
  }
}