import { Test, TestingModule } from '@nestjs/testing';
import { LfgService } from './lfg.service';

describe('LfgService', () => {
  let service: LfgService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LfgService],
    }).compile();

    service = module.get<LfgService>(LfgService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
