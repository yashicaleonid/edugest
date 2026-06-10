import { IsString, IsOptional } from 'class-validator';

export class UpdateDocenteDto {
  @IsOptional()
  @IsString()
  telefono?: string;
}