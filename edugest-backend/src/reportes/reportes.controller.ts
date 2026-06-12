import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reportes')
export class ReportesController {
  constructor(
    private readonly reportesService: ReportesService,
    private readonly mail: MailService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('resumen')
  @Roles(Role.ADMINISTRADOR, Role.DIRECTOR, Role.CAJERO)
  resumen(@Query('gestion') gestion?: string) {
    return this.reportesService.resumenGeneral(gestion ? parseInt(gestion) : undefined);
  }

  @Get('dashboard')
  @Roles(Role.ADMINISTRADOR, Role.DIRECTOR, Role.CAJERO, Role.DOCENTE)
  dashboard(@Query('gestion') gestion?: string) {
    return this.reportesService.dashboard(gestion ? parseInt(gestion) : undefined);
  }

  @Get('asistencia')
  @Roles(Role.ADMINISTRADOR, Role.DIRECTOR, Role.DOCENTE)
  asistencia(
    @Query('cursoId') cursoId?: string,
    @Query('gestion') gestion?: string,
  ) {
    return this.reportesService.reporteAsistencia(
      cursoId,
      gestion ? parseInt(gestion) : undefined,
    );
  }

  @Get('deudas')
  @Roles(Role.ADMINISTRADOR, Role.DIRECTOR, Role.CAJERO)
  deudas(@Query('gestion') gestion?: string) {
    return this.reportesService.reporteDeudas(gestion ? parseInt(gestion) : undefined);
  }

  @Get('inscripciones')
  @Roles(Role.ADMINISTRADOR, Role.DIRECTOR, Role.CAJERO)
  inscripciones(@Query('gestion') gestion?: string) {
    return this.reportesService.reporteInscripciones(gestion ? parseInt(gestion) : undefined);
  }

  @Post('enviar-avisos-deuda')
  @Roles(Role.ADMINISTRADOR, Role.DIRECTOR, Role.CAJERO)
  async enviarAvisosDeuda(@Query('gestion') gestion?: string) {
    const reporte = await this.reportesService.reporteDeudas(
      gestion ? parseInt(gestion) : undefined,
    );

    let enviados = 0;
    for (const deuda of reporte.deudas) {
      if (deuda?.emailPadre) {
        const partes = deuda.estudiante.split(' ');
        const nombreEstudiante = partes[0];
        const apellidoEstudiante = partes.slice(1).join(' ');
        await this.mail.enviarAvisoDeuda({
          emailPadre: deuda.emailPadre,
          nombrePadre: deuda.padre || 'Estimado padre/madre',
          nombreEstudiante,
          apellidoEstudiante,
          mesesPendientes: deuda.mesesPendientes,
          gestion: reporte.gestion,
        });
        enviados++;
      }
    }

    return { message: `${enviados} avisos de deuda enviados.`, total: enviados };
  }

  @Post('comunicado')
  @Roles(Role.ADMINISTRADOR, Role.DIRECTOR)
  async enviarComunicado(@Query('titulo') titulo: string, @Query('mensaje') mensaje: string) {
    const padres = await this.prisma.db.padreFamilia.findMany({
      where: { email: { not: null } },
      select: { email: true },
    });

    const emails = padres.map((p) => p.email!).filter(Boolean);
    await this.mail.enviarComunicado({ emails, titulo, mensaje });

    return { message: `Comunicado enviado a ${emails.length} destinatarios.` };
  }
}
