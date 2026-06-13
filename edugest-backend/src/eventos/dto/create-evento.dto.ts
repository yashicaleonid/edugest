import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateEventoDto {
  @IsString()
  titulo: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsDateString()
  fecha: string;

  @IsOptional()
  @IsString()
  lugar?: string;

  @IsString()
  creadoPorId: string;
}