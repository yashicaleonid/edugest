import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AsistenciaService } from './asistencia.service';
import { CreateAsistenciaDto } from './dto/create-asistencia.dto';
import { CreateAsistenciaMasivaDto } from './dto/create-asistencia-masiva.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('asistencia')
export class AsistenciaController {
  constructor(private readonly asistenciaService: AsistenciaService) {}

  @Post()
  create(@Body() dto: CreateAsistenciaDto) {
    return this.asistenciaService.create(dto);
  }

  @Post('masiva')
  createMasiva(@Body() dto: CreateAsistenciaMasivaDto) {
    return this.asistenciaService.createMasiva(dto);
  }

  @Get('curso/:cursoId')
  findByCurso(
    @Param('cursoId') cursoId: string,
    @Query('fecha') fecha?: string,
  ) {
    return this.asistenciaService.findByCurso(cursoId, fecha);
  }

  @Get('inscripcion/:inscripcionId')
  findByInscripcion(@Param('inscripcionId') inscripcionId: string) {
    return this.asistenciaService.findByInscripcion(inscripcionId);
  }

  @Get('inscripcion/:inscripcionId/resumen')
  resumen(@Param('inscripcionId') inscripcionId: string) {
    return this.asistenciaService.resumenByInscripcion(inscripcionId);
  }
}