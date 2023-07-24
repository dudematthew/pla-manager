import { Test, TestingModule } from '@nestjs/testing';
import { ApexStatisticsService } from './apex-statistics.service';

describe('ApexStatisticsService', () => {
  let service: ApexStatisticsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApexStatisticsService],
    }).compile();

    service = module.get<ApexStatisticsService>(ApexStatisticsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
