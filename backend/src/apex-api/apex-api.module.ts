import { Module } from '@nestjs/common';
import { ApexApiService } from './apex-api.service';
import { ApexApiController } from './apex-api.controller';
import { PuppeteerModule } from 'nest-puppeteer';
import { ApexApiScraperService } from './apex-api-scraper.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    // PuppeteerModule.forRoot(),
    HttpModule,
  ],
  providers: [
    ApexApiService,
    // ApexApiScraperService,
  ],
  controllers: [ApexApiController],
  exports: [ApexApiService],
})
export class ApexApiModule {}
