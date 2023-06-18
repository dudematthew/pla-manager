import { Test, TestingModule } from '@nestjs/testing';
import { InsideService } from './inside.service';

describe('InsideService', () => {
  let service: InsideService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InsideService],
    }).compile();

    service = module.get<InsideService>(InsideService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
