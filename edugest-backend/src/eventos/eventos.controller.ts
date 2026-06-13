import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { EventosService } from './eventos.service';
import { CreateEventoDto } from './dto/create-evento.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('eventos')
export class EventosController {
  constructor(private readonly eventosService: EventosService) {}

  @Post()
  @Roles(Role.ADMINISTRADOR, Role.DIRECTOR)
  create(@Body() dto: CreateEventoDto) {
    return this.eventosService.create(dto);
  }

  @Get()
  @Roles(Role.ADMINISTRADOR, Role.DIRECTOR, Role.CAJERO, Role.DOCENTE)
  findAll() {
    return this.eventosService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMINISTRADOR, Role.DIRECTOR, Role.CAJERO, Role.DOCENTE)
  findOne(@Param('id') id: string) {
    return this.eventosService.findOne(id);
  }

  @Delete(':id')
  @Roles(Role.ADMINISTRADOR, Role.DIRECTOR)
  remove(@Param('id') id: string) {
    return this.eventosService.remove(id);
  }
}