import { Test, TestingModule } from '@nestjs/testing';
import { InsideTeamsService } from './inside-teams.service';

describe('InsideTeamsService', () => {
  let service: InsideTeamsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InsideTeamsService],
    }).compile();

    service = module.get<InsideTeamsService>(InsideTeamsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
