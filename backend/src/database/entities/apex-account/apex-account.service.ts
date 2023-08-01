import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateApexAccountDto } from './dto/create-apex-account.dto';
import { UpdateApexAccountDto } from './dto/update-apex-account.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApexAccountEntity } from './entities/apex-account.entity';
import { UserEntity } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { PlayerStatistics } from 'src/apex-api/player-statistics.interface';
import { RoleService } from '../role/role.service';
import { RoleEntity } from '../role/entities/role.entity';
import { ApexAccountHistoryService } from '../apex-account-history/apex-account-history.service';

@Injectable()
export class ApexAccountService {

  public rankToRoleNameDictionary = {
    'Rookie': 'rookie',
    'Bronze': 'bronze',
    'Silver': 'silver',
    'Gold': 'gold',
    'Platinum': 'platinum',
    'Diamond': 'diamond',
    'Master': 'master',
    'Apex Predator': 'predator',
  }

  public rankToRoleColorDictionary = {
    'Rookie': '#e28743',
    'Bronze': '#cd7f32',
    'Silver': '#c0c0c0',
    'Gold': '#ffd700',
    'Platinum': '#e5e4e2',
    'Diamond': '#b9f2ff',
    'Master': '#8a2be2',
    'Apex Predator': '#ff0000',
  }

  public platformToEmojiNameDictionary = {
    'PC': 'origin',
    'PS4': 'ps4',
    'X1': 'xbox',
    'SWITCH': 'switch',
  };

  public rankDivToRomanDictionary = {
    '1': 'I',
    '2': 'II',
    '3': 'III',
    '4': 'IV',
    '0': '',
  };

  public platformAliases = {
    'PC': 'PC',
    'X1': 'Xbox',
    'PS4': 'PlayStation',
    'SWITCH': 'Nintendo Switch'
  }

  public rankToScoreDictionary = {
    'Rookie': 0,
    'Bronze': 4000,
    'Silver': 8000,
    'Gold': 12000,
    'Platinum': 16000,
    'Diamond': 20000,
    'Master': 24000,
    // 'Apex Predator': 24300, // test
  }

  constructor(
    @InjectRepository(ApexAccountEntity)
    private readonly apexAccountRepository: Repository<ApexAccountEntity>,
    private readonly userService: UserService,
    private readonly roleService: RoleService,
    private readonly apexAccountHistoryService: ApexAccountHistoryService,
  ) {}

  async create(account: CreateApexAccountDto): Promise<ApexAccountEntity> {
    // Check if account already exists
    if(await this.findByUID(account.uid)) {
      return null;
    }

    const newAccount = this.apexAccountRepository.create({
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

    const newAccountEntity = await this.apexAccountRepository.save(newAccount);

    // Create new history chunk
    await this.apexAccountHistoryService.create(newAccountEntity);

    return newAccountEntity;
  }

  public async saveAccount(playerData: PlayerStatistics, user: UserEntity): Promise<UserEntity> {
    console.log("Saving account: ", playerData.global.name, user.id);

    // Reasure that user is up to date
    user = await this.userService.findById(user.id);

    // Create data object
    const data = {
        user,
        name: playerData.global.name,
        uid: playerData.global.uid.toString(),
        avatarUrl: playerData.global?.avatar ?? null,
        platform: playerData.global?.platform ?? null,
        rankScore: playerData.global?.rank?.rankScore ?? null,
        rankName: playerData.global?.rank?.rankName ?? null,
        rankDivision: playerData.global?.rank?.rankDiv.toString() ?? null,
        rankImg: playerData.global?.rank?.rankImg ?? null,
        level: playerData.global?.level ?? null,
        percentToNextLevel: playerData.global?.toNextLevelPercent ?? null,
        brTotalKills: playerData.total?.specialEvent_kills?.value ?? null,
        brTotalWins: playerData.total?.specialEvent_wins?.value ?? null,
        brTotalDamage: playerData.total?.specialEvent_damage?.value ?? null,
        brTotalGamesPlayed: null, // Doesn't exist in API
        brKDR: parseInt(playerData.total?.kd?.value ?? null) ?? null,
        lastLegendPlayed: playerData.realtime?.selectedLegend ?? null,
    };

    let profile = null;

    // Check if user already has an apex account
    if(user.apexAccount) {
        // Update existing profile
        console.log("Updating existing profile");
        profile = await this.update(user.apexAccount.id, data);
    } else {
        // Create new profile
        console.log("Creating new profile");
        profile = await this.create(data);
    }


    // Check if profile was created or updated
    if (!profile) {
        return null;
    }

    // Get user
    user.apexAccount = profile;

    // Update users apex account
    await this.userService.update(user.id, user);

    // return updated user
    return user;
  }

  async update(id: number, properties: UpdateApexAccountDto): Promise<ApexAccountEntity> {
    const account = await this.findById(id);

    if(!account) {
      return null;
    }

    try {
        Object.assign(account, properties);

        const modifiedAccountEntity = await this.apexAccountRepository.save(account);

        // Create new history chunk
        await this.apexAccountHistoryService.create(modifiedAccountEntity);

        return modifiedAccountEntity;
    } catch (error) {
        throw new InternalServerErrorException(error);
    }
  }

  async remove (id: number): Promise<ApexAccountEntity> {
    const account = await this.findById(id);

    if(!account) {
      return null;
    }

    // Check if account is linked to a user
    if(account.user) {
      // Set user's apex account to null
      account.user.apexAccount = null;
      await account.user.save();
    }
  }

  async findById(id: number): Promise<ApexAccountEntity> {
    return await this.apexAccountRepository.findOne({
      where: { id },
      relations: ['user']
    });
  }

  async findByUID(uid: string): Promise<ApexAccountEntity> {
    return await this.apexAccountRepository.findOne({
      where: { uid },
      relations: ['user']
    });
  }

  async findByName(name: string): Promise<ApexAccountEntity> {
    return await this.apexAccountRepository.findOne({
      where: { name },
      relations: ['user']
    });
  }

  async findAll(): Promise<ApexAccountEntity[]> {
    return await this.apexAccountRepository.find({
      relations: ['user']
    });
  }

  /**
   * @param accountId id of the account
   * @returns rank of the account on the server
   */
  async getServerRankByAccountId(accountId: number) {

    console.log('account id: ', accountId);

    let subquery = this.apexAccountRepository.createQueryBuilder("apexAccount")
      .select('apexAccount.id', 'id')
      .addSelect('apexAccount.rank_score', 'rank_score')
      .addSelect('ROW_NUMBER() OVER (ORDER BY apexAccount.rank_score DESC)', 'rank');

    let result = await this.apexAccountRepository.createQueryBuilder()
      .select('subQuery.rank')
      .from("(" + subquery.getSql() + ")", 'subQuery')
      .where('subQuery.id = :account_id', { account_id: accountId })
      .getRawOne();

    return result?.rank ?? null;
  }

  /**
   * @param limit limit of accounts to return
   * @returns top X accounts on the server
   */
  async getServerRankTopX(limit: number): Promise<ApexAccountEntity[]> {
    return await this.apexAccountRepository.createQueryBuilder("apexAccount")
      .select('apexAccount.*')
      .addSelect('ROW_NUMBER() OVER (ORDER BY apexAccount.rank_score DESC)', 'rank')
      .limit(limit)
      .getRawMany();
  }

  public getRoleNameByRankName(rankName: string): string {
    const roleName = this.rankToRoleNameDictionary[rankName] ?? null;

    if (!roleName) {
      console.error(`Role name for rank ${rankName} not found`);
      return roleName;
    }

    return roleName;
  }

  public async getRoleByRankName(rankName: string): Promise<RoleEntity> {
    const roleName = this.getRoleNameByRankName(rankName);

    if(!roleName) {
      return null;
    }

    const role = await this.roleService.findByName(roleName);

    if(!role) {
      return null;
    }

    return role;
  }

  public async getRoleByAccountId(accountId: number): Promise<RoleEntity> {
    const account = await this.findById(accountId);

    if(!account) {
      return null;
    }

    return await this.getRoleByRankName(account.rankName);
  }

  public async getServerAvgRankScore(): Promise<number> {
    const result = await this.apexAccountRepository.createQueryBuilder("apexAccount")
      .select('AVG(apexAccount.rank_score)', 'avg')
      .getRawOne();

    return result?.avg ?? null;
  }

}
