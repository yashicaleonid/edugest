import { IsString, IsInt, IsOptional, IsUUID } from 'class-validator';

export class UpdateCursoDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  nivel?: string;

  @IsOptional()
  @IsString()
  paralelo?: string;

  @IsOptional()
  @IsString()
  turno?: string;

  @IsOptional()
  @IsInt()
  gestion?: number;

  @IsOptional()
  @IsUUID()
  docenteId?: string;

  @IsOptional()
  @IsInt()
  cupo?: number;
}