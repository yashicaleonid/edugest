import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { InscripcionesService } from './inscripciones.service';
import { CreateInscripcionDto } from './dto/create-inscripcion.dto';
import { UpdateInscripcionDto } from './dto/update-inscripcion.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inscripciones')
export class InscripcionesController {
  constructor(private readonly inscripcionesService: InscripcionesService) {}

  @Post()
  @Roles(Role.ADMINISTRADOR, Role.DIRECTOR, Role.CAJERO)
  create(@Body() dto: CreateInscripcionDto) {
    return this.inscripcionesService.create(dto);
  }

  @Post(':id/renovar')
  @Roles(Role.ADMINISTRADOR, Role.DIRECTOR, Role.CAJERO)
  renovar(
    @Param('id') id: string,
    @Body() body: { gestion: number; cursoId?: string },
  ) {
    return this.inscripcionesService.renovar(id, body.gestion, body.cursoId);
  }

  @Get()
  @Roles(Role.ADMINISTRADOR, Role.DIRECTOR, Role.CAJERO)
  findAll(
    @Query('gestion') gestion?: string,
    @Query('estado') estado?: string,
  ) {
    return this.inscripcionesService.findAll({
      gestion: gestion ? parseInt(gestion) : undefined,
      estado,
    });
  }

  @Get(':id')
  @Roles(Role.ADMINISTRADOR, Role.DIRECTOR, Role.CAJERO)
  findOne(@Param('id') id: string) {
    return this.inscripcionesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMINISTRADOR, Role.DIRECTOR, Role.CAJERO)
  update(@Param('id') id: string, @Body() dto: UpdateInscripcionDto) {
    return this.inscripcionesService.update(id, dto);
  }
}