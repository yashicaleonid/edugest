import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CursosService } from './cursos.service';
import { CreateCursoDto } from './dto/create-curso.dto';
import { UpdateCursoDto } from './dto/update-curso.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('cursos')
export class CursosController {
  constructor(private readonly cursosService: CursosService) {}

  @Post()
  @Roles(Role.ADMINISTRADOR, Role.DIRECTOR)
  create(@Body() dto: CreateCursoDto) {
    return this.cursosService.create(dto);
  }

  @Get()
  @Roles(Role.ADMINISTRADOR, Role.DIRECTOR, Role.CAJERO, Role.DOCENTE)
  findAll() {
    return this.cursosService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMINISTRADOR, Role.DIRECTOR, Role.CAJERO, Role.DOCENTE)
  findOne(@Param('id') id: string) {
    return this.cursosService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMINISTRADOR, Role.DIRECTOR)
  update(@Param('id') id: string, @Body() dto: UpdateCursoDto) {
    return this.cursosService.update(id, dto);
  }
}
