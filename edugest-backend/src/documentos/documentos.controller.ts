import {
  Controller, Get, Post, Delete, Param, Query, UseGuards,
  UseInterceptors, UploadedFile, Request, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentosService } from './documentos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CategoriaDocumento, Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('documentos')
export class DocumentosController {
  constructor(private readonly documentosService: DocumentosService) {}

  @Post('upload')
  @Roles(Role.ADMINISTRADOR, Role.DIRECTOR, Role.CAJERO, Role.DOCENTE)
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Query('categoria') categoria: CategoriaDocumento,
    @Query('estudianteId') estudianteId: string | undefined,
    @Request() req: { user: { id: string } },
  ) {
    if (!file) {
      throw new BadRequestException('Debe adjuntar un archivo.');
    }

    return this.documentosService.upload(
      file,
      categoria || CategoriaDocumento.OTRO,
      estudianteId,
      req.user.id,
    );
  }

  @Get()
  @Roles(Role.ADMINISTRADOR, Role.DIRECTOR, Role.CAJERO, Role.DOCENTE)
  findAll(
    @Query('categoria') categoria?: CategoriaDocumento,
    @Query('estudianteId') estudianteId?: string,
  ) {
    return this.documentosService.findAll(categoria, estudianteId);
  }

  @Get(':id')
  @Roles(Role.ADMINISTRADOR, Role.DIRECTOR, Role.CAJERO, Role.DOCENTE)
  findOne(@Param('id') id: string) {
    return this.documentosService.findOne(id);
  }

  @Delete(':id')
  @Roles(Role.ADMINISTRADOR, Role.DIRECTOR)
  remove(@Param('id') id: string) {
    return this.documentosService.remove(id);
  }
}
