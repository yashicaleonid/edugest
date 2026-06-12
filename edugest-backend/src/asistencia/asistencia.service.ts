import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { CreateAsistenciaDto } from './dto/create-asistencia.dto';
import { CreateAsistenciaMasivaDto } from './dto/create-asistencia-masiva.dto';

@Injectable()
export class AsistenciaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  private async notificarPadreSiAusente(inscripcionId: string, fecha: string, estado: string) {
    if (!['AUSENTE', 'RETRASO'].includes(estado)) return;

    const inscripcion = await this.prisma.db.inscripcion.findUnique({
      where: { id: inscripcionId },
      include: {
        estudiante: { include: { padre: true } },
        curso: { select: { nombre: true, paralelo: true } },
      },
    });

    if (inscripcion?.estudiante?.padre?.email) {
      await this.mail.enviarAlertaAsistencia({
        emailPadre: inscripcion.estudiante.padre.email,
        nombrePadre: `${inscripcion.estudiante.padre.nombre} ${inscripcion.estudiante.padre.apellido}`,
        nombreEstudiante: inscripcion.estudiante.nombre,
        apellidoEstudiante: inscripcion.estudiante.apellido,
        fecha: new Date(fecha).toLocaleDateString('es-BO'),
        estado,
        curso: `${inscripcion.curso.nombre} ${inscripcion.curso.paralelo}`,
      });
    }
  }

  async create(dto: CreateAsistenciaDto) {
    const inscripcion = await this.prisma.db.inscripcion.findUnique({
      where: { id: dto.inscripcionId },
    });

    if (!inscripcion) {
      throw new NotFoundException(`Inscripción con id ${dto.inscripcionId} no encontrada.`);
    }

    const registro = await this.prisma.db.asistencia.create({
      data: {
        inscripcionId: dto.inscripcionId,
        fecha: new Date(dto.fecha),
        estado: dto.estado,
      },
      include: {
        inscripcion: {
          include: {
            estudiante: {
              select: { nombre: true, apellido: true },
            },
          },
        },
      },
    });

    await this.notificarPadreSiAusente(dto.inscripcionId, dto.fecha, dto.estado);
    return registro;
  }

  async createMasiva(dto: CreateAsistenciaMasivaDto) {
    const registros = dto.registros.map((r) => ({
      inscripcionId: r.inscripcionId,
      fecha: new Date(dto.fecha),
      estado: r.estado,
    }));

    await this.prisma.db.asistencia.createMany({
      data: registros,
      skipDuplicates: true,
    });

    for (const r of dto.registros) {
      await this.notificarPadreSiAusente(r.inscripcionId, dto.fecha, r.estado);
    }

    return {
      message: `${registros.length} registros de asistencia guardados para ${dto.fecha}.`,
      total: registros.length,
    };
  }

  async findByCurso(cursoId: string, fecha?: string) {
    return this.prisma.db.asistencia.findMany({
      where: {
        inscripcion: { cursoId },
        ...(fecha && { fecha: new Date(fecha) }),
      },
      include: {
        inscripcion: {
          include: {
            estudiante: {
              select: { id: true, nombre: true, apellido: true, ci: true },
            },
          },
        },
      },
      orderBy: { fecha: 'desc' },
    });
  }

  async findByInscripcion(inscripcionId: string) {
    return this.prisma.db.asistencia.findMany({
      where: { inscripcionId },
      orderBy: { fecha: 'desc' },
    });
  }

  async resumenByInscripcion(inscripcionId: string) {
    const registros = await this.prisma.db.asistencia.findMany({
      where: { inscripcionId },
    });

    const total = registros.length;
    const presentes = registros.filter((r) => r.estado === 'PRESENTE').length;
    const ausentes = registros.filter((r) => r.estado === 'AUSENTE').length;
    const tardanzas = registros.filter((r) => r.estado === 'RETRASO').length;
    const permisos = registros.filter((r) => r.estado === 'PERMISO').length;

    return {
      total,
      presentes,
      ausentes,
      tardanzas,
      retrasos: tardanzas,
      permisos,
      porcentajeAsistencia: total > 0 ? ((presentes / total) * 100).toFixed(1) + '%' : '0%',
    };
  }
}