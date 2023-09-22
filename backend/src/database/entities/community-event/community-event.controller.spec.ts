import { Test, TestingModule } from '@nestjs/testing';
import { CommunityEventController } from './community-event.controller';
import { CommunityEventService } from './community-event.service';

describe('CommunityEventController', () => {
  let controller: CommunityEventController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommunityEventController],
      providers: [CommunityEventService],
    }).compile();

    controller = module.get<CommunityEventController>(CommunityEventController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
