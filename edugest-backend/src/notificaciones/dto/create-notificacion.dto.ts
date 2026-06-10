import { IsString, IsUUID } from 'class-validator';

export class CreateNotificacionDto {
  @IsUUID()
  usuarioId: string;

  @IsString()
  titulo: string;

  @IsString()
  mensaje: string;
}