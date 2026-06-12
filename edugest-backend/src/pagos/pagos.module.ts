import { Module } from '@nestjs/common';
import { PagosController } from './pagos.controller';
import { PagosService } from './pagos.service';
import { FacturasModule } from '../facturas/facturas.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

@Module({
  imports: [FacturasModule, NotificacionesModule],
  controllers: [PagosController],
  providers: [PagosService],
})
export class PagosModule {}
