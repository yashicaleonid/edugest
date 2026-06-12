import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { CreateAsistenciaDto } from './dto/create-asistencia.dto';
import { CreateAsistenciaMasivaDto } from './dto/create-asistencia-masiva.dto';

@Injectable()
export class AsistenciaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly notificaciones: NotificacionesService,
  ) {}

  private async notificarPadreSiAusente(inscripcionId: string, fecha: string, estado: string) {
    if (!['AUSENTE', 'RETRASO'].includes(estado)) return;

    const inscripcion = await this.prisma.db.inscripcion.findUnique({
      where: { id: inscripcionId },
      include: {
        estudiante: { include: { padre: true } },
        curso: { select: { nombre: true, paralelo: true, docenteId: true } },
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

    if (inscripcion?.curso?.docenteId) {
      const docente = await this.prisma.db.docente.findUnique({
        where: { id: inscripcion.curso.docenteId },
        select: { usuarioId: true },
      });
      if (docente) {
        await this.notificaciones.notificarUsuario(
          docente.usuarioId,
          'Alerta de asistencia',
          `${inscripcion.estudiante.nombre} ${inscripcion.estudiante.apellido} marcado como ${estado} el ${new Date(fecha).toLocaleDateString('es-BO')}.`,
        );
      }
    }

    await this.notificaciones.notificarPorRoles(
      [Role.ADMINISTRADOR, Role.DIRECTOR],
      'Alerta de asistencia',
      `${inscripcion?.estudiante.nombre} ${inscripcion?.estudiante.apellido} — ${estado} (${new Date(fecha).toLocaleDateString('es-BO')}).`,
    );
  }

  private async upsertRegistro(inscripcionId: string, fecha: Date, estado: string) {
    const existente = await this.prisma.db.asistencia.findFirst({
      where: { inscripcionId, fecha },
    });

    if (existente) {
      return this.prisma.db.asistencia.update({
        where: { id: existente.id },
        data: { estado },
      });
    }

    return this.prisma.db.asistencia.create({
      data: { inscripcionId, fecha, estado },
    });
  }

  async create(dto: CreateAsistenciaDto) {
    const inscripcion = await this.prisma.db.inscripcion.findUnique({
      where: { id: dto.inscripcionId },
    });

    if (!inscripcion) {
      throw new NotFoundException(`Inscripción con id ${dto.inscripcionId} no encontrada.`);
    }

    const fecha = new Date(dto.fecha);
    const registro = await this.upsertRegistro(dto.inscripcionId, fecha, dto.estado);

    await this.notificarPadreSiAusente(dto.inscripcionId, dto.fecha, dto.estado);

    return this.prisma.db.asistencia.findUnique({
      where: { id: registro.id },
      include: {
        inscripcion: {
          include: {
            estudiante: { select: { nombre: true, apellido: true } },
            curso: { select: { nombre: true, paralelo: true } },
          },
        },
      },
    });
  }

  async createMasiva(dto: CreateAsistenciaMasivaDto) {
    const fecha = new Date(dto.fecha);

    for (const r of dto.registros) {
      await this.upsertRegistro(r.inscripcionId, fecha, r.estado);
      await this.notificarPadreSiAusente(r.inscripcionId, dto.fecha, r.estado);
    }

    return {
      message: `${dto.registros.length} registros de asistencia guardados para ${dto.fecha}.`,
      total: dto.registros.length,
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
            curso: { select: { id: true, nombre: true, paralelo: true } },
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