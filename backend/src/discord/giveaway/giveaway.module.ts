import { Module } from '@nestjs/common';
import { GiveawayService } from './giveaway.service';

@Module({
  providers: [GiveawayService],
  exports: [GiveawayService],
})
export class GiveawayModule {}
