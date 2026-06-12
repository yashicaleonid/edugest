import { Controller, Get, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { UsuariosService } from './usuarios.service';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  @Roles(Role.ADMINISTRADOR, Role.DIRECTOR)
  findAll() {
    return this.usuariosService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMINISTRADOR, Role.DIRECTOR)
  findOne(@Param('id') id: string) {
    return this.usuariosService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMINISTRADOR, Role.DIRECTOR)
  update(@Param('id') id: string, @Body() dto: UpdateUsuarioDto) {
    return this.usuariosService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMINISTRADOR, Role.DIRECTOR)
  deactivate(@Param('id') id: string) {
    return this.usuariosService.deactivate(id);
  }
}
