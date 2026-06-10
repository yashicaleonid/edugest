import { Module } from '@nestjs/common';
import { PadresController } from './padres.controller';
import { PadresService } from './padres.service';

@Module({
  controllers: [PadresController],
  providers: [PadresService]
})
export class PadresModule {}
