import { Module } from '@nestjs/common';
import { ApexApiService } from './apex-api.service';
import { ApexApiController } from './apex-api.controller';
import { PuppeteerModule } from 'nest-puppeteer';

@Module({
  imports: [PuppeteerModule.forRoot()],
  providers: [ApexApiService],
  controllers: [ApexApiController],
  exports: [ApexApiService],
})
export class ApexApiModule {}
