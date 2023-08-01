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

  /**
   * Get player history
   * Note: history records wont contain userAccount data
   * @param account account to get history for
   * @param days how many days to get history for
   * @returns player history for last x days
   */
  public async getPlayerHistory(account: ApexAccountEntity, days: number): Promise<ApexAccountHistoryEntity[]> {
  
    let daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - days);
    
    // inner query to get the max id for each day
    const subQueryResults = await this.apexAccountHistoryRepository.createQueryBuilder('ah2')
      .select('MAX(ah2.id)', 'id')
      .where("ah2.apexAccount = :accountId", { accountId: account.id })
      .andWhere("ah2.createdAt >= :daysAgo", { daysAgo: daysAgo.toISOString() })
      .groupBy("DATE(ah2.createdAt)")
      .getRawMany();
  
    const maxIds = subQueryResults.map(result => result.id);
  
    // make the outer query to get full records
    const playerHistory = await this.apexAccountHistoryRepository.createQueryBuilder('ah')
      .whereInIds(maxIds)
      .getMany();
  
    return playerHistory;
  }
  
  


}
