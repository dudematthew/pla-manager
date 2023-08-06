import { Test, TestingModule } from '@nestjs/testing';
import { ApexSeasonService } from './apex-season.service';

describe('ApexSeasonService', () => {
  let service: ApexSeasonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApexSeasonService],
    }).compile();

    service = module.get<ApexSeasonService>(ApexSeasonService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
