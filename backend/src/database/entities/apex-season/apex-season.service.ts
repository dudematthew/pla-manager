import { Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { CreateApexSeasonDto } from './dto/create-apex-season.dto';
import { UpdateApexSeasonDto } from './dto/update-apex-season.dto';
import { ApexSeasonEntity } from './entities/apex-season.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ApexSeasonApiService } from 'src/apex-api/apex-season-api.service';
import { ApexCurrentSeason } from 'src/apex-api/apex-current-season-interface';
import { ApexSeason } from 'src/apex-api/apex-season-interface';
import { DiscordService } from 'src/discord/discord.service';
import { CronService } from 'src/cron/cron.service';

@Injectable()
export class ApexSeasonService {
  constructor(
      @InjectRepository(ApexSeasonEntity)
      private readonly apexSeasonRepository: Repository<ApexSeasonEntity>,
      private readonly apexSeasonApiService: ApexSeasonApiService,
      @Inject(forwardRef(() => DiscordService))
      private readonly discordService: DiscordService,
      private readonly cronService: CronService,
  ){
    this.init();
  }

  private async init() {
    await this.discordService.isReady();

    this.populateDatabase();
  }

  /**
   * Find a season by its ID
   * @param id The ID of the season
   * @returns The season
   */
  async findById(id: number): Promise<ApexSeasonEntity> {
      return await this.apexSeasonRepository.findOneBy({ id });
  }

  /**
   * Create a new season
   * @param season: CreateApexSeasonDto
   * @returns The created season
   */
  async create(season: CreateApexSeasonDto): Promise<ApexSeasonEntity> {
      const newSeason = this.apexSeasonRepository.create(season);
      return await this.apexSeasonRepository.save(newSeason);
  }

  /**
   * Update a season by its ID
   * @param id: The ID of the season to update
   * @param updateData: UpdateApexSeasonDto
   * @returns The updated season
   */
  async update(id: number, updateData: UpdateApexSeasonDto): Promise<ApexSeasonEntity> {
      const season = await this.findById(id);

      if (!season) {
          return null;
      }

      const updatedSeason = Object.assign(season, updateData);
      await this.apexSeasonRepository.save(updatedSeason);

      return updatedSeason;
  }

  async saveSeason(apiSeason: ApexSeason, currentApiSeason: ApexCurrentSeason = null): Promise<ApexSeasonEntity> {
    // create and save the new season entity based on current API data
    const newSeason = this.apexSeasonRepository.create({
      id: apiSeason.info.ID,
      name: apiSeason.info.Name,
      tagline: apiSeason.info.Tagline,
      currentSplit: currentApiSeason?.info?.Split,
      splitDate: (currentApiSeason?.dates?.Split) ? new Date(currentApiSeason.dates.Split * 1000) : null,
      startDate: new Date(apiSeason.dates.Start * 1000),
      endDate: new Date(apiSeason.dates.End * 1000),
      newLegend: apiSeason.new.Legend,
      newWeapon: apiSeason.new.Weapon,
      newMap: apiSeason.new.Map,
      color: apiSeason.misc.Color,
      link: apiSeason.misc.Link,
    }); 

    // save the new season to the database
    return await this.apexSeasonRepository.save(newSeason);
  }

  /**
   * Populate the database with all seasons
   * with data from the API if they don't exist
   */
  async populateDatabase(): Promise<void> {
    console.log(`Database population started`);

    // Check if the newest season has passed using only the database
    const newestSeason = await this.getNewestSeason();
  
    const currentDate = new Date();

    let currentSeason: ApexSeasonEntity;
  
    if (newestSeason && new Date(newestSeason?.endDate) > currentDate) currentSeason = newestSeason;
    else {

      console.info(`Getting current season from because newestSeason: ${newestSeason?.id} and newestSeason.endDate: ${newestSeason?.endDate} and currentDate: ${currentDate}`)

      const currentApiSeason = await this.apexSeasonApiService.getCurrentSeason();
      const fullCurrentApiSeason = await this.apexSeasonApiService.getSeason(currentApiSeason.info.ID);
  
      if (currentApiSeason.error || fullCurrentApiSeason.error) {
        throw new NotFoundException('Unable to retrieve current season information from API');
      }

      currentSeason = await this.saveSeason(fullCurrentApiSeason, currentApiSeason);

      if (!currentSeason) {
        throw new NotFoundException('Unable to save current season to database');
      }
    }

    // Schedule a cron job to run after season end
    let seasonEnd = new Date(currentSeason.endDate);
    seasonEnd.setHours(seasonEnd.getHours() + 1);
    
    // If date is in the past, run the cron job an hour after the current time
    if (seasonEnd < new Date()) {
      seasonEnd = new Date();
      seasonEnd.setHours(seasonEnd.getHours() + 1);
    }

    const cronExpression = `0 ${seasonEnd.getMinutes()} ${seasonEnd.getHours()} ${seasonEnd.getDate()} ${seasonEnd.getMonth() + 1} *`;

    this.cronService.scheduleCronJob(
      `updateSeason`,
      cronExpression,
      this.populateDatabase,
    );
  
    // Check if every season prior to the newest season exists in the database and fill missing seasons
    for (let seasonNumber = currentSeason.id - 1; seasonNumber >= 1; seasonNumber--) {
      let season = await this.apexSeasonRepository.findOneBy({ id: seasonNumber });
  
      // if the season doesn't exist in the database or has incomplete data, fetch it from the API
      if (!season || !season.endDate || !season.startDate) {
        const apiSeason = await this.apexSeasonApiService.getSeason(seasonNumber);
  
        if (apiSeason.error) {
          throw new NotFoundException(`Unable to retrieve season ${seasonNumber} information from API`);
        }
  
        season = await this.saveSeason(apiSeason);
      }
    }

    console.log(`Database population finished`);
  }
  
  public isSeasonFinished(season: ApexSeasonEntity): boolean {
      const currentDate = new Date();
      return new Date(season.endDate) <= currentDate;
  }

  public async getNewestSeason(): Promise<ApexSeasonEntity> {
    return (await this.apexSeasonRepository.find({ order: { id: "DESC" }, take: 1 }))[0];
  }

  public async isCurrentSeason(season: ApexSeasonEntity): Promise<boolean> {
    const currentSeason = await this.getNewestSeason();

    console.info(`Checking if season ${season.id} is current season: ${currentSeason.id} and the answer is ${currentSeason.id === season.id}`);

    return currentSeason.id === season.id;
  }
}
