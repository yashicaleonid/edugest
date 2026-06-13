import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles(Role.ADMINISTRADOR, Role.DIRECTOR)
  findAll(
    @Query('usuarioId') usuarioId?: string,
    @Query('modulo') modulo?: string,
  ) {
    return this.auditService.findAll({ usuarioId, modulo });
  }

  @Get('usuario/:usuarioId')
  @Roles(Role.ADMINISTRADOR, Role.DIRECTOR)
  findByUsuario(@Param('usuarioId') usuarioId: string) {
    return this.auditService.findByUsuario(usuarioId);
  }
}