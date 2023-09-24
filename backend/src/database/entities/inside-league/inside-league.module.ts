import { Module } from '@nestjs/common';
import { InsideLeagueService } from './inside-league.service';

@Module({
  providers: [InsideLeagueService],
  exports: [InsideLeagueService],
})
export class InsideLeagueModule {}
