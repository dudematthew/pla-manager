import { Test, TestingModule } from '@nestjs/testing';
import { RoleGroupService } from './role-group.service';

describe('RoleGroupService', () => {
  let service: RoleGroupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoleGroupService],
    }).compile();

    service = module.get<RoleGroupService>(RoleGroupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
