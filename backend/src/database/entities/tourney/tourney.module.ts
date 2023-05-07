import { Module } from '@nestjs/common';
import { TourneyService } from './tourney.service';
import { TourneyController } from './tourney.controller';
import { TeamModule } from './entities/team/tourney-team.module';

@Module({
  imports: [
    TeamModule,
  ],
  controllers: [TourneyController],
  providers: [TourneyService],
})
export class TourneyModule {}
