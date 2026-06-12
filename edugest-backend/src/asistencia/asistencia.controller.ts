import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AsistenciaService } from './asistencia.service';
import { CreateAsistenciaDto } from './dto/create-asistencia.dto';
import { CreateAsistenciaMasivaDto } from './dto/create-asistencia-masiva.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('asistencia')
export class AsistenciaController {
  constructor(private readonly asistenciaService: AsistenciaService) {}

  @Post()
  @Roles(Role.ADMINISTRADOR, Role.DIRECTOR, Role.DOCENTE)
  create(@Body() dto: CreateAsistenciaDto) {
    return this.asistenciaService.create(dto);
  }

  @Post('masiva')
  @Roles(Role.ADMINISTRADOR, Role.DIRECTOR, Role.DOCENTE)
  createMasiva(@Body() dto: CreateAsistenciaMasivaDto) {
    return this.asistenciaService.createMasiva(dto);
  }

  @Get('curso/:cursoId')
  @Roles(Role.ADMINISTRADOR, Role.DIRECTOR, Role.DOCENTE)
  findByCurso(
    @Param('cursoId') cursoId: string,
    @Query('fecha') fecha?: string,
  ) {
    return this.asistenciaService.findByCurso(cursoId, fecha);
  }

  @Get('inscripcion/:inscripcionId')
  @Roles(Role.ADMINISTRADOR, Role.DIRECTOR, Role.DOCENTE)
  findByInscripcion(@Param('inscripcionId') inscripcionId: string) {
    return this.asistenciaService.findByInscripcion(inscripcionId);
  }

  @Get('inscripcion/:inscripcionId/resumen')
  @Roles(Role.ADMINISTRADOR, Role.DIRECTOR, Role.DOCENTE)
  resumen(@Param('inscripcionId') inscripcionId: string) {
    return this.asistenciaService.resumenByInscripcion(inscripcionId);
  }
}
