import { Test, TestingModule } from '@nestjs/testing';
import { PadresService } from './padres.service';

describe('PadresService', () => {
  let service: PadresService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PadresService],
    }).compile();

    service = module.get<PadresService>(PadresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
