import { Injectable } from '@nestjs/common';
import { CreateApexAccountDto } from './dto/create-apex-account.dto';
import { UpdateApexAccountDto } from './dto/update-apex-account.dto';

@Injectable()
export class ApexAccountService {
  create(createApexAccountDto: CreateApexAccountDto) {
    return 'This action adds a new apexAccount';
  }

  findAll() {
    return `This action returns all apexAccount`;
  }

  findOne(id: number) {
    return `This action returns a #${id} apexAccount`;
  }

  update(id: number, updateApexAccountDto: UpdateApexAccountDto) {
    return `This action updates a #${id} apexAccount`;
  }

  remove(id: number) {
    return `This action removes a #${id} apexAccount`;
  }
}
