import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { CreateInscripcionDto } from './dto/create-inscripcion.dto';
import { UpdateInscripcionDto } from './dto/update-inscripcion.dto';

@Injectable()
export class InscripcionesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly notificaciones: NotificacionesService,
  ) {}

  async create(dto: CreateInscripcionDto) {
    const existe = await this.prisma.db.inscripcion.findFirst({
      where: { estudianteId: dto.estudianteId, cursoId: dto.cursoId, gestion: dto.gestion },
    });
    if (existe) throw new ConflictException('El estudiante ya esta inscrito en este curso para esta gestion.');

    const curso = await this.prisma.db.curso.findUnique({
      where: { id: dto.cursoId },
      include: { _count: { select: { inscripciones: true } } },
    });
    if (!curso) throw new NotFoundException('Curso no encontrado.');

    if (curso._count.inscripciones >= curso.cupo) {
      throw new BadRequestException(`El curso ha alcanzado su cupo máximo de ${curso.cupo} estudiantes.`);
    }

    const inscripcion = await this.prisma.db.inscripcion.create({
      data: dto,
      include: {
        estudiante: { include: { padre: true } },
        curso: { select: { id: true, nombre: true, nivel: true, paralelo: true, gestion: true } },
      },
    });

    // Enviar correo al padre si tiene email
    if (inscripcion.estudiante?.padre?.email) {
      await this.mail.enviarConfirmacionInscripcion({
        emailPadre: inscripcion.estudiante.padre.email,
        nombrePadre: `${inscripcion.estudiante.padre.nombre} ${inscripcion.estudiante.padre.apellido}`,
        nombreEstudiante: inscripcion.estudiante.nombre,
        apellidoEstudiante: inscripcion.estudiante.apellido,
        curso: `${inscripcion.curso.nombre} ${inscripcion.curso.paralelo}`,
        gestion: inscripcion.gestion,
      });
    }

    await this.notificaciones.notificarPorRoles(
      [Role.ADMINISTRADOR, Role.DIRECTOR, Role.CAJERO],
      'Nueva inscripción',
      `${inscripcion.estudiante.nombre} ${inscripcion.estudiante.apellido} inscrito en ${inscripcion.curso.nombre} ${inscripcion.curso.paralelo} (${inscripcion.gestion}).`,
    );

    return inscripcion;
  }

  async findAll(filtros?: { gestion?: number; estado?: string }) {
    return this.prisma.db.inscripcion.findMany({
      where: {
        ...(filtros?.gestion && { gestion: filtros.gestion }),
        ...(filtros?.estado && { estado: filtros.estado }),
      },
      include: {
        estudiante: { select: { id: true, nombre: true, apellido: true, ci: true } },
        curso: { select: { id: true, nombre: true, nivel: true, paralelo: true, turno: true, gestion: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const inscripcion = await this.prisma.db.inscripcion.findUnique({
      where: { id },
      include: {
        estudiante: { include: { padre: true } },
        curso: {
          include: {
            docente: { include: { usuario: { select: { nombre: true, apellido: true } } } },
          },
        },
        pagos: { include: { factura: true, cajero: { select: { nombre: true, apellido: true } } } },
        asistencias: true,
      },
    });
    if (!inscripcion) throw new NotFoundException(`Inscripcion con id ${id} no encontrada.`);
    return inscripcion;
  }

  async update(id: string, dto: UpdateInscripcionDto) {
    await this.findOne(id);
    return this.prisma.db.inscripcion.update({
      where: { id },
      data: dto,
      include: {
        estudiante: { select: { nombre: true, apellido: true } },
        curso: { select: { nombre: true, nivel: true, paralelo: true } },
      },
    });
  }

  async renovar(id: string, nuevaGestion: number, cursoId?: string) {
    const anterior = await this.findOne(id);

    if (nuevaGestion <= anterior.gestion) {
      throw new BadRequestException('La nueva gestión debe ser posterior a la inscripción anterior.');
    }

    const cursoIdFinal = cursoId || anterior.cursoId;

    if (cursoId) {
      const curso = await this.prisma.db.curso.findUnique({ where: { id: cursoId } });
      if (!curso) throw new NotFoundException('Curso no encontrado.');
      if (curso.gestion !== nuevaGestion) {
        throw new BadRequestException('El curso seleccionado no corresponde a la nueva gestión.');
      }
    }

    return this.create({
      estudianteId: anterior.estudianteId,
      cursoId: cursoIdFinal,
      gestion: nuevaGestion,
    });
  }
}