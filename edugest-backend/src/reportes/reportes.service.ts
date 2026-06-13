import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

@Injectable()
export class ReportesService {
  constructor(private readonly prisma: PrismaService) {}

  async resumenGeneral(gestion?: number) {
    const gestionActual = gestion || new Date().getFullYear();

    const [
      totalEstudiantes,
      estudiantesActivos,
      totalDocentes,
      totalCursos,
      inscripcionesActivas,
      totalPagos,
      totalFacturas,
      usuariosActivos,
    ] = await Promise.all([
      this.prisma.db.estudiante.count(),
      this.prisma.db.estudiante.count({ where: { isActive: true } }),
      this.prisma.db.docente.count(),
      this.prisma.db.curso.count({ where: { gestion: gestionActual } }),
      this.prisma.db.inscripcion.count({ where: { gestion: gestionActual, estado: 'ACTIVO' } }),
      this.prisma.db.pago.count({ where: { gestion: gestionActual } }),
      this.prisma.db.factura.count(),
      this.prisma.db.usuario.count({ where: { isActive: true } }),
    ]);

    const pagos = await this.prisma.db.pago.findMany({
      where: { gestion: gestionActual },
      select: { monto: true, metodoPago: true, mes: true },
    });

    const ingresosTotales = pagos.reduce((sum, p) => sum + Number(p.monto), 0);

    const ingresosPorMes = MESES.map((mes) => ({
      mes,
      total: pagos.filter((p) => p.mes === mes).reduce((sum, p) => sum + Number(p.monto), 0),
    }));

    const pagosPorMetodo = [
      { metodo: 'EFECTIVO', label: 'Efectivo' },
      { metodo: 'QR', label: 'QR' },
      { metodo: 'TRANSFERENCIA', label: 'Transferencia' },
    ].map(({ metodo, label }) => ({
      metodo: label,
      total: pagos.filter((p) => p.metodoPago === metodo).reduce((sum, p) => sum + Number(p.monto), 0),
      cantidad: pagos.filter((p) => p.metodoPago === metodo).length,
    }));

    return {
      gestion: gestionActual,
      academicos: {
        totalEstudiantes,
        estudiantesActivos,
        totalDocentes,
        totalCursos,
        inscripcionesActivas,
      },
      financieros: {
        totalPagos,
        ingresosTotales,
        ingresosPorMes,
        pagosPorMetodo,
        totalFacturas,
      },
      administrativos: {
        usuariosActivos,
      },
    };
  }

  async reporteAsistencia(cursoId?: string, gestion?: number) {
    const gestionActual = gestion || new Date().getFullYear();

    const asistencias = await this.prisma.db.asistencia.findMany({
      where: {
        inscripcion: {
          gestion: gestionActual,
          ...(cursoId && { cursoId }),
        },
      },
      include: {
        inscripcion: {
          include: {
            estudiante: { select: { nombre: true, apellido: true } },
            curso: { select: { nombre: true, paralelo: true } },
          },
        },
      },
    });

    const resumen = {
      total: asistencias.length,
      presentes: asistencias.filter((a) => a.estado === 'PRESENTE').length,
      ausentes: asistencias.filter((a) => a.estado === 'AUSENTE').length,
      retrasos: asistencias.filter((a) => a.estado === 'RETRASO').length,
      permisos: asistencias.filter((a) => a.estado === 'PERMISO').length,
    };

    return { gestion: gestionActual, resumen, registros: asistencias };
  }

  async reporteDeudas(gestion?: number) {
    const gestionActual = gestion || new Date().getFullYear();
    const mesActual = new Date().getMonth();

    const inscripciones = await this.prisma.db.inscripcion.findMany({
      where: { gestion: gestionActual, estado: 'ACTIVO' },
      include: {
        estudiante: { include: { padre: true } },
        curso: { select: { nombre: true, paralelo: true } },
        pagos: { select: { mes: true } },
      },
    });

    const deudas = inscripciones
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
          padre: inscripcion.estudiante.padre
            ? `${inscripcion.estudiante.padre.nombre} ${inscripcion.estudiante.padre.apellido}`
            : null,
          emailPadre: inscripcion.estudiante.padre?.email,
          mesesPendientes,
        };
      })
      .filter(Boolean);

    return { gestion: gestionActual, totalDeudores: deudas.length, deudas };
  }

  async reporteInscripciones(gestion?: number) {
    const gestionActual = gestion || new Date().getFullYear();

    return this.prisma.db.inscripcion.findMany({
      where: { gestion: gestionActual },
      include: {
        estudiante: { select: { nombre: true, apellido: true, ci: true, isActive: true } },
        curso: { select: { nombre: true, nivel: true, paralelo: true, turno: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async dashboard(gestion?: number) {
    const gestionActual = gestion || new Date().getFullYear();
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    const [resumen, asistenciasHoy, pagosHoy] = await Promise.all([
      this.resumenGeneral(gestionActual),
      this.prisma.db.asistencia.count({
        where: {
          fecha: { gte: hoy, lt: manana },
          inscripcion: { gestion: gestionActual },
        },
      }),
      this.prisma.db.pago.count({
        where: {
          createdAt: { gte: hoy, lt: manana },
          gestion: gestionActual,
        },
      }),
    ]);

    return {
      ...resumen,
      operativos: { asistenciasHoy, pagosHoy },
    };
  }
  async reporteDocentes(gestion?: number) {
  const gestionActual = gestion || new Date().getFullYear();

  const cursos = await this.prisma.db.curso.findMany({
    where: { gestion: gestionActual },
    include: {
      docente: {
        include: {
          usuario: { select: { nombre: true, apellido: true, email: true, ci: true } },
        },
      },
      _count: { select: { inscripciones: true } },
    },
    orderBy: { nombre: 'asc' },
  });

  return {
    gestion: gestionActual,
    total: cursos.length,
    cursos: cursos.map((c) => ({
      id: c.id,
      nombre: c.nombre,
      nivel: c.nivel,
      paralelo: c.paralelo,
      turno: c.turno,
      cupo: c.cupo,
      inscritos: c._count.inscripciones,
      docente: c.docente
        ? {
            nombre: c.docente.usuario.nombre,
            apellido: c.docente.usuario.apellido,
            email: c.docente.usuario.email,
            ci: c.docente.usuario.ci,
          }
        : null,
    })),
  };
}
}
