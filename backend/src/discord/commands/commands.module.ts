import { Module, Injectable, forwardRef } from '@nestjs/common';
import { CommandsService } from './commands.service';
import { RoleModule } from 'src/database/entities/role/role.module';
import { ApexConnectModule } from '../apex-connect/apex-connect.module';
import { InsideModule } from '../inside/inside.module';
import { EmojiModule } from 'src/database/entities/emoji/emoji.module';
import { AdminCommandsService } from './admin-commands.service';
import { InsideCommandsService } from './inside-commands.service';
import { DiscordModule } from '../discord.module';
import { RoleGroupModule } from 'src/database/entities/role-group/role-group.module';
import { DatabaseModule } from 'src/database/database.module';
import { ApexStatisticsModule } from '../apex-statistics/apex-statistics.module';
import { StatisticsCommandsService } from './statistics-commands.service';
import { CommunityEventsCommandService } from './community-events-commands.service';
import { CommunityEventsModule } from '../community-events/community-events.module';
import { GiveawayModule } from '../giveaway/giveaway.module';
import { GiveawayCommandService } from './giveaway-commands.service';

@Module({
  imports: [
    RoleModule,
    ApexConnectModule,
    ApexStatisticsModule,
    InsideModule,
    EmojiModule,
    DatabaseModule,
    ApexStatisticsModule,
    CommunityEventsModule,
    forwardRef(() => DiscordModule),
    GiveawayModule,
  ],
  providers: [
    CommandsService,
    AdminCommandsService,
    InsideCommandsService,
    StatisticsCommandsService,
    CommunityEventsCommandService,
    GiveawayCommandService,
  ],
})
export class CommandsModule {}
