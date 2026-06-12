import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PagosService } from './pagos.service';
import { CreatePagoDto } from './dto/create-pago.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('pagos')
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  @Post()
  @Roles(Role.ADMINISTRADOR, Role.DIRECTOR, Role.CAJERO)
  create(@Body() dto: CreatePagoDto) {
    return this.pagosService.create(dto);
  }

  @Get()
  @Roles(Role.ADMINISTRADOR, Role.DIRECTOR, Role.CAJERO)
  findAll() {
    return this.pagosService.findAll();
  }

  @Get('inscripcion/:inscripcionId')
  @Roles(Role.ADMINISTRADOR, Role.DIRECTOR, Role.CAJERO)
  findByInscripcion(@Param('inscripcionId') inscripcionId: string) {
    return this.pagosService.findByInscripcion(inscripcionId);
  }

  @Get('deudas/:gestion')
  @Roles(Role.ADMINISTRADOR, Role.DIRECTOR, Role.CAJERO)
  findDeudas(@Param('gestion') gestion: string) {
    return this.pagosService.getDeudas(parseInt(gestion));
  }

  @Get(':id')
  @Roles(Role.ADMINISTRADOR, Role.DIRECTOR, Role.CAJERO)
  findOne(@Param('id') id: string) {
    return this.pagosService.findOne(id);
  }
}
