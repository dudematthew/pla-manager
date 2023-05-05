import { Test, TestingModule } from '@nestjs/testing';
import { ApexApiService } from './apex-api.service';

describe('ApexApiService', () => {
  let service: ApexApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApexApiService],
    }).compile();

    service = module.get<ApexApiService>(ApexApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
