import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { HtmlApiService } from './html-api.service';

@Module({
  imports: [
    HttpModule,
  ],
  providers: [
    HtmlApiService,
  ],
  exports: [HtmlApiService],
})
export class HtmlApiModule {}
