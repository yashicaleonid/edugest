import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { EstudiantesService } from './estudiantes.service';
import { CreateEstudianteDto } from './dto/create-estudiante.dto';
import { UpdateEstudianteDto } from './dto/update-estudiante.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('estudiantes')
export class EstudiantesController {
  constructor(private readonly estudiantesService: EstudiantesService) {}

  @Post()
  @Roles(Role.ADMINISTRADOR, Role.DIRECTOR, Role.CAJERO)
  create(@Body() dto: CreateEstudianteDto) {
    return this.estudiantesService.create(dto);
  }

  @Get()
  @Roles(Role.ADMINISTRADOR, Role.DIRECTOR, Role.CAJERO, Role.DOCENTE)
  findAll() {
    return this.estudiantesService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMINISTRADOR, Role.DIRECTOR, Role.CAJERO, Role.DOCENTE)
  findOne(@Param('id') id: string) {
    return this.estudiantesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMINISTRADOR, Role.DIRECTOR, Role.CAJERO)
  update(@Param('id') id: string, @Body() dto: UpdateEstudianteDto) {
    return this.estudiantesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMINISTRADOR, Role.DIRECTOR)
  deactivate(@Param('id') id: string) {
    return this.estudiantesService.deactivate(id);
  }
}
