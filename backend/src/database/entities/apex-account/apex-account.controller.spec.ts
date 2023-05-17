import { Test, TestingModule } from '@nestjs/testing';
import { ApexAccountController } from './apex-account.controller';
import { ApexAccountService } from './apex-account.service';

describe('ApexAccountController', () => {
  let controller: ApexAccountController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApexAccountController],
      providers: [ApexAccountService],
    }).compile();

    controller = module.get<ApexAccountController>(ApexAccountController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
