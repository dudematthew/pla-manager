import { Test, TestingModule } from '@nestjs/testing';
import { TourneyService } from './tourney.service';

describe('TourneyService', () => {
  let service: TourneyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TourneyService],
    }).compile();

    service = module.get<TourneyService>(TourneyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
