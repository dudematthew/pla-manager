import { Test, TestingModule } from '@nestjs/testing';
import { TourneyController } from './tourney.controller';
import { TourneyService } from './tourney.service';

describe('TourneyController', () => {
  let controller: TourneyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TourneyController],
      providers: [TourneyService],
    }).compile();

    controller = module.get<TourneyController>(TourneyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
