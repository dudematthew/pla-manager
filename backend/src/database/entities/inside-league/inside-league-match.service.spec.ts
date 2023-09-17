import { Test, TestingModule } from '@nestjs/testing';
import { InsideLeagueMatchService } from './inside-league.service';

describe('InsideLeagueMatchService', () => {
  let service: InsideLeagueMatchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InsideLeagueMatchService],
    }).compile();

    service = module.get<InsideLeagueMatchService>(InsideLeagueMatchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
