import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateDocenteDto {
  @IsUUID()
  usuarioId: string;

  @IsOptional()
  @IsString()
  telefono?: string;
}