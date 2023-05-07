import { Module } from '@nestjs/common';
import { TeamService } from './tourney-team.service';
import { TeamController } from './tourney-team.controller';

@Module({
  controllers: [TeamController],
  providers: [TeamService]
})
export class TeamModule {}
