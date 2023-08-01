import { Injectable } from '@nestjs/common';
import { CreateApexAccountHistoryDto } from './dto/create-apex-account-history.dto';
import { UpdateApexAccountHistoryDto } from './dto/update-apex-account-history.dto';
import { ApexAccountHistoryEntity } from './entities/apex-account-history.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ApexAccountEntity } from '../apex-account/entities/apex-account.entity';

@Injectable()
export class ApexAccountHistoryService {

  constructor(
    @InjectRepository(ApexAccountHistoryEntity)
    private readonly apexAccountHistoryRepository: Repository<ApexAccountHistoryEntity>,
  ) {}

  public async create (account: ApexAccountEntity) {

    // Create new ApexAccountHistoryEntity
    const newAccountHistoryChunk = this.apexAccountHistoryRepository.create({
      ...account,
      apexAccount: account,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Remove id from new ApexAccountHistoryEntity so it can be created
    delete newAccountHistoryChunk.id;

    console.log("Creating new account history chunk: ", newAccountHistoryChunk);

    return await this.apexAccountHistoryRepository.insert(newAccountHistoryChunk);
  }
}
