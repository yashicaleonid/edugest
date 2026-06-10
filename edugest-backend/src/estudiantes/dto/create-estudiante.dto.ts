import { IsString, IsDateString, IsOptional, IsUUID } from 'class-validator';

export class CreateEstudianteDto {
  @IsString()
  nombre: string;

  @IsString()
  apellido: string;

  @IsString()
  ci: string;

  @IsDateString()
  fechaNac: string;

  @IsOptional()
  @IsString()
  foto?: string;

  @IsUUID()
  padreId: string;
}