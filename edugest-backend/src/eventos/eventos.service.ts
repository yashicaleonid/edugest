import { Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { CreateEventoDto } from './dto/create-evento.dto';

@Injectable()
export class EventosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly notificaciones: NotificacionesService,
  ) {}

  async create(dto: CreateEventoDto) {
    const evento = await this.prisma.db.evento.create({
      data: {
        titulo: dto.titulo,
        descripcion: dto.descripcion,
        fecha: new Date(dto.fecha),
        lugar: dto.lugar,
        creadoPorId: dto.creadoPorId,
      },
      include: {
        creadoPor: { select: { nombre: true, apellido: true } },
      },
    });

    // Notificar a todos los roles internos
    await this.notificaciones.notificarPorRoles(
      [Role.ADMINISTRADOR, Role.DIRECTOR, Role.CAJERO, Role.DOCENTE],
      'Nuevo evento académico',
      `${evento.titulo} — ${new Date(evento.fecha).toLocaleDateString('es-BO')}${evento.lugar ? ` en ${evento.lugar}` : ''}.`,
    );

    // Notificar a todos los padres por correo
    const padres = await this.prisma.db.padreFamilia.findMany({
      where: { email: { not: null } },
      select: { email: true },
    });

    const emails = padres.map((p) => p.email!).filter(Boolean);

    if (emails.length > 0) {
      await this.mail.enviarComunicado({
        emails,
        titulo: `Evento académico: ${evento.titulo}`,
        mensaje: `
          Fecha: ${new Date(evento.fecha).toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' })}
          ${evento.lugar ? `Lugar: ${evento.lugar}` : ''}
          ${evento.descripcion ? `\n${evento.descripcion}` : ''}
        `.trim(),
      });
    }

    return evento;
  }

  async findAll() {
    return this.prisma.db.evento.findMany({
      include: {
        creadoPor: { select: { nombre: true, apellido: true } },
      },
      orderBy: { fecha: 'asc' },
    });
  }

  async findOne(id: string) {
    const evento = await this.prisma.db.evento.findUnique({
      where: { id },
      include: {
        creadoPor: { select: { nombre: true, apellido: true } },
      },
    });
    if (!evento) throw new NotFoundException(`Evento con id ${id} no encontrado.`);
    return evento;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.db.evento.delete({ where: { id } });
    return { message: 'Evento eliminado exitosamente.' };
  }
}