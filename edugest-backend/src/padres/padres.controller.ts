import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { PadresService } from './padres.service';
import { CreatePadreDto } from './dto/create-padre.dto';
import { UpdatePadreDto } from './dto/update-padre.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('padres')
export class PadresController {
  constructor(private readonly padresService: PadresService) {}

  @Post()
  create(@Body() dto: CreatePadreDto) {
    return this.padresService.create(dto);
  }

  @Get()
  findAll() {
    return this.padresService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.padresService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePadreDto) {
    return this.padresService.update(id, dto);
  }
}