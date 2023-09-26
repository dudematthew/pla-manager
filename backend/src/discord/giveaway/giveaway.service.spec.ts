import { Test, TestingModule } from '@nestjs/testing';
import { GiveawayService } from './giveaway.service';

describe('GiveawayService', () => {
  let service: GiveawayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GiveawayService],
    }).compile();

    service = module.get<GiveawayService>(GiveawayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
