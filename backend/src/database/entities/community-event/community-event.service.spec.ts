import { Test, TestingModule } from '@nestjs/testing';
import { CommunityEventService } from './community-event.service';

describe('CommunityEventService', () => {
  let service: CommunityEventService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommunityEventService],
    }).compile();

    service = module.get<CommunityEventService>(CommunityEventService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
