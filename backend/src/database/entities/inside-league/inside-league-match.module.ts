import { Module } from '@nestjs/common';
import { InsideLeagueMatchService } from './inside-league.service';

@Module({
  providers: [InsideLeagueMatchService],
  exports: [InsideLeagueMatchService],
})
export class InsideLeagueMatchModule {}
