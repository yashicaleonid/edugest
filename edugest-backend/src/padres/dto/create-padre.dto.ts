import { IsString, IsOptional, IsEmail } from 'class-validator';

export class CreatePadreDto {
  @IsString()
  nombre: string;

  @IsString()
  apellido: string;

  @IsString()
  ci: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}