import { Module, forwardRef } from '@nestjs/common';
import { ApexApiService } from './apex-api.service';
import { ApexApiController } from './apex-api.controller';
import { PuppeteerModule } from 'nest-puppeteer';
import { ApexApiScraperService } from './apex-api-scraper.service';
import { HttpModule } from '@nestjs/axios';
import { ApexSeasonApiService } from './apex-season-api.service';
import { DiscordModule } from 'src/discord/discord.module';

@Module({
  imports: [
    // PuppeteerModule.forRoot(),
    HttpModule,
  ],
  providers: [
    ApexApiService,
    // ApexApiScraperService,
    ApexSeasonApiService,
  ],
  controllers: [ApexApiController],
  exports: [
    ApexApiService,
    ApexSeasonApiService,
  ],
})
export class ApexApiModule {}
