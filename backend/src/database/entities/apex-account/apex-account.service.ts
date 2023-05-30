import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateApexAccountDto } from './dto/create-apex-account.dto';
import { UpdateApexAccountDto } from './dto/update-apex-account.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApexAccountEntity } from './entities/apex-account.entity';
import { UserEntity } from '../user/user.entity';

@Injectable()
export class ApexAccountService {

  constructor(
    @InjectRepository(ApexAccountEntity)
    private readonly apexAccountRepository: Repository<ApexAccountEntity>,
  ) {}

  async create(account: CreateApexAccountDto): Promise<ApexAccountEntity> {
    // Check if account already exists
    if(await this.findByUID(account.uid)) {
      return null;
    }

    const newAccount = this.apexAccountRepository.create({
      user: account.user,
      name: account.name,
      uid: account.uid,
      avatarUrl: account.avatarUrl,
      platform: account.platform,
      rankScore: account.rankScore,
      rankName: account.rankName,
      rankDivision: account.rankDivision,
      rankImg: account.rankImg,
      level: account.level,
      percentToNextLevel: account.percentToNextLevel,
      brTotalKills: account.brTotalKills,
      brTotalWins: account.brTotalWins,
      brTotalGamesPlayed: account.brTotalGamesPlayed,
      brKDR: account.brKDR,
      brTotalDamage: account.brTotalDamage,
      lastLegendPlayed: account.lastLegendPlayed,
    });

    return await this.apexAccountRepository.save(newAccount);
  }

  async update(id: number, properties: UpdateApexAccountDto): Promise<ApexAccountEntity> {
    const account = await this.findById(id);

    if(!account) {
      return null;
    }

    try {
        Object.assign(account, properties);

        return await this.apexAccountRepository.save(account);
    } catch (error) {
        throw new InternalServerErrorException(error);
    }
  }

  async findById(id: number): Promise<ApexAccountEntity> {
    return await this.apexAccountRepository.findOneBy({ id });
  }

  async findByUID(uid: string): Promise<ApexAccountEntity> {
    return await this.apexAccountRepository.findOneBy({ uid });
  }

  async findByUsername(username: string): Promise<ApexAccountEntity> {
    return await this.apexAccountRepository.findOneBy({ name: username });
  }

  
}
