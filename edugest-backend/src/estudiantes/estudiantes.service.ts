import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEstudianteDto } from './dto/create-estudiante.dto';
import { UpdateEstudianteDto } from './dto/update-estudiante.dto';

@Injectable()
export class EstudiantesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEstudianteDto) {
    return this.prisma.db.estudiante.create({
      data: {
        ...dto,
        fechaNac: new Date(dto.fechaNac),
      },
      include: { padre: true },
    });
  }

  async findAll() {
    return this.prisma.db.estudiante.findMany({
      include: {
        padre: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            telefono: true,
            email: true,
          },
        },
      },
      orderBy: { apellido: 'asc' },
    });
  }

  async findOne(id: string) {
    const estudiante = await this.prisma.db.estudiante.findUnique({
      where: { id },
      include: {
        padre: true,
        inscripciones: {
          include: { curso: true },
        },
      },
    });

    if (!estudiante) {
      throw new NotFoundException(`Estudiante con id ${id} no encontrado.`);
    }

    return estudiante;
  }

  async update(id: string, dto: UpdateEstudianteDto) {
    await this.findOne(id);

    return this.prisma.db.estudiante.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.fechaNac && { fechaNac: new Date(dto.fechaNac) }),
      },
      include: { padre: true },
    });
  }

  async deactivate(id: string) {
    await this.findOne(id);

    return this.prisma.db.estudiante.update({
      where: { id },
      data: { isActive: false },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        isActive: true,
      },
    });
  }
  async historialAcademico(id: string) {
  const estudiante = await this.prisma.db.estudiante.findUnique({
    where: { id },
    include: {
      padre: { select: { nombre: true, apellido: true, ci: true, telefono: true, email: true } },
      inscripciones: {
        orderBy: { gestion: 'desc' },
        include: {
          curso: {
            include: {
              docente: {
                include: {
                  usuario: { select: { nombre: true, apellido: true } },
                },
              },
            },
          },
          pagos: {
            include: { factura: true },
            orderBy: { createdAt: 'desc' },
          },
          asistencias: {
            orderBy: { fecha: 'desc' },
          },
        },
      },
    },
  });

  if (!estudiante) throw new NotFoundException(`Estudiante con id ${id} no encontrado.`);

  return {
    estudiante: {
      id: estudiante.id,
      nombre: estudiante.nombre,
      apellido: estudiante.apellido,
      ci: estudiante.ci,
      fechaNac: estudiante.fechaNac,
      foto: estudiante.foto,
      isActive: estudiante.isActive,
      padre: estudiante.padre,
    },
    historial: estudiante.inscripciones.map((ins) => {
      const total = ins.asistencias.length;
      const presentes = ins.asistencias.filter((a) => a.estado === 'PRESENTE').length;
      const ausentes = ins.asistencias.filter((a) => a.estado === 'AUSENTE').length;
      const retrasos = ins.asistencias.filter((a) => a.estado === 'RETRASO').length;
      const permisos = ins.asistencias.filter((a) => a.estado === 'PERMISO').length;

      return {
        inscripcionId: ins.id,
        gestion: ins.gestion,
        estado: ins.estado,
        curso: {
          nombre: ins.curso.nombre,
          nivel: ins.curso.nivel,
          paralelo: ins.curso.paralelo,
          turno: ins.curso.turno,
          docente: ins.curso.docente?.usuario
            ? `${ins.curso.docente.usuario.nombre} ${ins.curso.docente.usuario.apellido}`
            : null,
        },
        asistencia: {
          total,
          presentes,
          ausentes,
          retrasos,
          permisos,
          porcentaje: total > 0 ? ((presentes / total) * 100).toFixed(1) + '%' : '0%',
        },
        pagos: ins.pagos.map((p) => ({
          mes: p.mes,
          gestion: p.gestion,
          monto: p.monto,
          metodoPago: p.metodoPago,
          factura: p.factura ? p.factura.estado : null,
          fecha: p.createdAt,
        })),
      };
    }),
  };
}
}