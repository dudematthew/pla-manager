import { Test, TestingModule } from '@nestjs/testing';
import { IntroduceService } from './introduce.service';

describe('IntroduceService', () => {
  let service: IntroduceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IntroduceService],
    }).compile();

    service = module.get<IntroduceService>(IntroduceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
