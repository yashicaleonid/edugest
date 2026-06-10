import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service';
import { CreateNotificacionDto } from './dto/create-notificacion.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('notificaciones')
export class NotificacionesController {
  constructor(private readonly notificacionesService: NotificacionesService) {}

  @Post()
  create(@Body() dto: CreateNotificacionDto) {
    return this.notificacionesService.create(dto);
  }

  @Get('usuario/:usuarioId')
  findByUsuario(@Param('usuarioId') usuarioId: string) {
    return this.notificacionesService.findByUsuario(usuarioId);
  }

  @Get('usuario/:usuarioId/no-leidas')
  findNoLeidas(@Param('usuarioId') usuarioId: string) {
    return this.notificacionesService.findNoLeidas(usuarioId);
  }

  @Patch(':id/leer')
  marcarLeida(@Param('id') id: string) {
    return this.notificacionesService.marcarLeida(id);
  }

  @Patch('usuario/:usuarioId/leer-todas')
  marcarTodasLeidas(@Param('usuarioId') usuarioId: string) {
    return this.notificacionesService.marcarTodasLeidas(usuarioId);
  }
}