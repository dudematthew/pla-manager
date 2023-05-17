import { Test, TestingModule } from '@nestjs/testing';
import { ApexConnectService } from './apex-connect.service';

describe('ApexConnectService', () => {
  let service: ApexConnectService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApexConnectService],
    }).compile();

    service = module.get<ApexConnectService>(ApexConnectService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
