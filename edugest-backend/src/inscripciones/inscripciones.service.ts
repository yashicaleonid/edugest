import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { CreateInscripcionDto } from './dto/create-inscripcion.dto';
import { UpdateInscripcionDto } from './dto/update-inscripcion.dto';

@Injectable()
export class InscripcionesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
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

    return inscripcion;
  }

  async findAll() {
    return this.prisma.db.inscripcion.findMany({
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
}