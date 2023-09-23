import { Test, TestingModule } from '@nestjs/testing';
import { CommunityEventsService } from './community-events.service';

describe('CommunityEventsService', () => {
  let service: CommunityEventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommunityEventsService],
    }).compile();

    service = module.get<CommunityEventsService>(CommunityEventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
