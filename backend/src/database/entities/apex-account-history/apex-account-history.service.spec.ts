import { Test, TestingModule } from '@nestjs/testing';
import { ApexAccountHistoryService } from './apex-account-history.service';

describe('ApexAccountHistoryService', () => {
  let service: ApexAccountHistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApexAccountHistoryService],
    }).compile();

    service = module.get<ApexAccountHistoryService>(ApexAccountHistoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
