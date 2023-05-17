import { Test, TestingModule } from '@nestjs/testing';
import { ApexAccountService } from './apex-account.service';

describe('ApexAccountService', () => {
  let service: ApexAccountService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApexAccountService],
    }).compile();

    service = module.get<ApexAccountService>(ApexAccountService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
