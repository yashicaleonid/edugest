import { Module } from '@nestjs/common';
import { FacturasController } from './facturas.controller';
import { FacturasService } from './facturas.service';
import { CucuService } from './cucu.service';

@Module({
  controllers: [FacturasController],
  providers: [FacturasService, CucuService],
  exports: [FacturasService],
})
export class FacturasModule {}
