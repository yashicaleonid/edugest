import { IsInt, IsUUID, IsOptional, IsString } from 'class-validator';

export class CreateInscripcionDto {
  @IsUUID()
  estudianteId: string;

  @IsUUID()
  cursoId: string;

  @IsInt()
  gestion: number;

  @IsOptional()
  @IsString()
  estado?: string;
}