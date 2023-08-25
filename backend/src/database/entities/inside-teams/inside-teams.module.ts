import { Module } from '@nestjs/common';
import { InsideTeamsService } from './inside-teams.service';
import { RoleModule } from '../role/role.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InsideTeamEntity } from './entities/inside-team.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([InsideTeamEntity]),
    RoleModule,
  ],
  providers: [
    InsideTeamsService,
  ],
  exports: [
    InsideTeamsService,
  ],
})
export class InsideTeamsModule {}
