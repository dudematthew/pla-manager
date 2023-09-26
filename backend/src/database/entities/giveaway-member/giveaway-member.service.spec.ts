import { Test, TestingModule } from '@nestjs/testing';
import { GiveawayMemberService } from './giveaway-member.service';

describe('GiveawayMemberService', () => {
  let service: GiveawayMemberService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GiveawayMemberService],
    }).compile();

    service = module.get<GiveawayMemberService>(GiveawayMemberService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
