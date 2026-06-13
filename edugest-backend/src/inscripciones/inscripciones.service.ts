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
        curso: {
          select: {
            id: true,
            nombre: true,
            nivel: true,
            paralelo: true,
            turno: true,
            gestion: true,
            docente: {
              include: {
                usuario: { select: { nombre: true, apellido: true } },
              },
            },
          },
        },
      },
    });

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

  async generarComprobante(id: string): Promise<Buffer> {
    const inscripcion = await this.findOne(id);

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const PDFDocument = require('pdfkit');
    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // ── Encabezado ──────────────────────────────────────────
      doc
        .fontSize(22)
        .fillColor('#1976d2')
        .text('EduGest', { align: 'center' })
        .fontSize(11)
        .fillColor('#555555')
        .text('Sistema de Gestión Escolar', { align: 'center' })
        .moveDown(0.5);

      doc
        .fontSize(14)
        .fillColor('#111111')
        .text('COMPROBANTE DE INSCRIPCIÓN', { align: 'center', underline: true })
        .moveDown(1);

      // ── Datos del estudiante ─────────────────────────────────
      doc.fontSize(12).fillColor('#1976d2').text('Datos del Estudiante').moveDown(0.3);
      doc.fontSize(10).fillColor('#111111');
      doc.text(`Nombre:     ${inscripcion.estudiante.nombre} ${inscripcion.estudiante.apellido}`);
      doc.text(`CI:         ${inscripcion.estudiante.ci}`);
      doc.moveDown(0.8);

      // ── Datos del curso ──────────────────────────────────────
      doc.fontSize(12).fillColor('#1976d2').text('Datos del Curso').moveDown(0.3);
      doc.fontSize(10).fillColor('#111111');
      doc.text(`Curso:      ${inscripcion.curso.nombre}`);
      doc.text(`Nivel:      ${inscripcion.curso.nivel}`);
      doc.text(`Paralelo:   ${inscripcion.curso.paralelo}`);
      doc.text(`Turno:      ${inscripcion.curso.turno}`);
      doc.text(`Gestión:    ${inscripcion.gestion}`);
      doc.text(`Estado:     ${inscripcion.estado}`);
      doc.moveDown(0.8);

      // ── Tutor / Padre ────────────────────────────────────────
      if (inscripcion.estudiante.padre) {
        const p = inscripcion.estudiante.padre;
        doc.fontSize(12).fillColor('#1976d2').text('Tutor / Padre de Familia').moveDown(0.3);
        doc.fontSize(10).fillColor('#111111');
        doc.text(`Nombre:     ${p.nombre} ${p.apellido}`);
        doc.text(`CI:         ${p.ci}`);
        if (p.telefono) doc.text(`Teléfono:   ${p.telefono}`);
        if (p.email)    doc.text(`Correo:     ${p.email}`);
        doc.moveDown(0.8);
      }

      // ── Docente asignado ─────────────────────────────────────
      if (inscripcion.curso.docente?.usuario) {
        const u = inscripcion.curso.docente.usuario;
        doc.fontSize(12).fillColor('#1976d2').text('Docente Asignado').moveDown(0.3);
        doc.fontSize(10).fillColor('#111111');
        doc.text(`Nombre:     ${u.nombre} ${u.apellido}`);
        doc.moveDown(0.8);
      }

      // ── Fecha de emisión ─────────────────────────────────────
      doc
        .fontSize(9)
        .fillColor('#888888')
        .text(
          `Emitido el ${new Date().toLocaleDateString('es-BO', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          })}`,
          { align: 'right' },
        );

      doc.end();
    });
  }
}