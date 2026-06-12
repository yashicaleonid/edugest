import { IsString, IsInt, IsOptional, IsUUID } from 'class-validator';

export class CreateCursoDto {
  @IsString()
  nombre: string;

  @IsString()
  nivel: string;

  @IsString()
  paralelo: string;

  @IsString()
  turno: string;

  @IsInt()
  gestion: number;

  @IsOptional()
  @IsUUID()
  docenteId?: string;

  @IsOptional()
  @IsInt()
  cupo?: number;
}