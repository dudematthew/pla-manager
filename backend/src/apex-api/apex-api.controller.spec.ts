import { Test, TestingModule } from '@nestjs/testing';
import { ApexApiController } from './apex-api.controller';

describe('ApexApiController', () => {
  let controller: ApexApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApexApiController],
    }).compile();

    controller = module.get<ApexApiController>(ApexApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
