import { Controller, Get, Post, Patch, Param, UseGuards } from '@nestjs/common';
import { FacturasService } from './facturas.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('facturas')
export class FacturasController {
  constructor(private readonly facturasService: FacturasService) {}

  @Post('emitir/:pagoId')
  emitir(@Param('pagoId') pagoId: string) {
    return this.facturasService.emitir(pagoId);
  }

  @Get()
  findAll() {
    return this.facturasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.facturasService.findOne(id);
  }

  @Patch(':id/anular')
  anular(@Param('id') id: string) {
    return this.facturasService.anular(id);
  }
}