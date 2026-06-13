import { Controller, Get, Post, Patch, Param, UseGuards } from '@nestjs/common';
import { FacturasService } from './facturas.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('facturas')
export class FacturasController {
  constructor(private readonly facturasService: FacturasService) {}

  @Post('emitir/:pagoId')
  @Roles(Role.ADMINISTRADOR, Role.DIRECTOR, Role.CAJERO)
  emitir(@Param('pagoId') pagoId: string) {
    return this.facturasService.emitir(pagoId);
  }

  @Get()
  @Roles(Role.ADMINISTRADOR, Role.DIRECTOR, Role.CAJERO)
  findAll() {
    return this.facturasService.findAll();
  }

  @Get(':id/estado')
  @Roles(Role.ADMINISTRADOR, Role.DIRECTOR, Role.CAJERO)
  consultarEstado(@Param('id') id: string) {
    return this.facturasService.consultarEstado(id);
  }

  @Get(':id/validar')
  @Roles(Role.ADMINISTRADOR, Role.DIRECTOR, Role.CAJERO)
  validarSin(@Param('id') id: string) {
    return this.facturasService.validarSin(id);
  }

  @Get(':id/pdf')
  @Roles(Role.ADMINISTRADOR, Role.DIRECTOR, Role.CAJERO)
  descargarPdf(@Param('id') id: string) {
    return this.facturasService.descargarPdf(id);
  }

  @Post(':id/reenviar')
  @Roles(Role.ADMINISTRADOR, Role.DIRECTOR, Role.CAJERO)
  reenviarCorreo(@Param('id') id: string) {
    return this.facturasService.reenviarCorreo(id);
  }

  @Patch(':id/anular')
  @Roles(Role.ADMINISTRADOR, Role.DIRECTOR)
  anular(@Param('id') id: string) {
    return this.facturasService.anular(id);
  }

  @Get(':id')
  @Roles(Role.ADMINISTRADOR, Role.DIRECTOR, Role.CAJERO)
  findOne(@Param('id') id: string) {
    return this.facturasService.findOne(id);
  }
}
