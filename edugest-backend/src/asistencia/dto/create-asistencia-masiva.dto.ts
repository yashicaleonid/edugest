import { IsArray, IsDateString, ValidateNested, IsUUID, IsString } from 'class-validator';
import { Type } from 'class-transformer';

class RegistroAsistencia {
  @IsUUID()
  inscripcionId: string;

  @IsString()
  estado: string;
}

export class CreateAsistenciaMasivaDto {
  @IsDateString()
  fecha: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RegistroAsistencia)
  registros: RegistroAsistencia[];
}