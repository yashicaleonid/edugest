import { IsString, IsDateString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateEstudianteDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  apellido?: string;

  @IsOptional()
  @IsString()
  ci?: string;

  @IsOptional()
  @IsDateString()
  fechaNac?: string;

  @IsOptional()
  @IsString()
  foto?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}