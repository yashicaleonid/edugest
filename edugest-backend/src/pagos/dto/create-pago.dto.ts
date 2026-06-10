import { IsString, IsUUID, IsNumber, IsPositive } from 'class-validator';

export class CreatePagoDto {
  @IsUUID()
  inscripcionId: string;

  @IsUUID()
  cajeroId: string;

  @IsNumber()
  @IsPositive()
  monto: number;

  @IsString()
  metodoPago: string;

  @IsString()
  mes: string;

  @IsNumber()
  @IsPositive()
  gestion: number;
}