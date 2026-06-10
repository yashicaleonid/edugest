import { IsString, IsUUID, IsDateString } from 'class-validator';

export class CreateAsistenciaDto {
  @IsUUID()
  inscripcionId: string;

  @IsDateString()
  fecha: string;

  @IsString()
  estado: string; // PRESENTE, AUSENTE, TARDANZA
}