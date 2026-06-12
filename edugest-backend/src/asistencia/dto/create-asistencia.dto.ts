import { IsString, IsUUID, IsDateString, IsIn } from 'class-validator';

export class CreateAsistenciaDto {
  @IsUUID()
  inscripcionId: string;

  @IsDateString()
  fecha: string;

  @IsString()
  @IsIn(['PRESENTE', 'AUSENTE', 'RETRASO', 'PERMISO'], {
    message: 'El estado debe ser PRESENTE, AUSENTE, RETRASO o PERMISO.',
  })
  estado: string;
}