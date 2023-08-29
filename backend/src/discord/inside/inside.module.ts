import { Module } from '@nestjs/common';
import { InsideService } from './inside.service';
import { RoleModule } from 'src/database/entities/role/role.module';
import { DiscordModule } from '../discord.module';
import { forwardRef } from '@nestjs/common';
import { EmojiModule } from 'src/database/entities/emoji/emoji.module';
import { manageMembersService } from './manage-members.service';
import { teamsCompositionService } from './teams-composition.service';
import { InsideTeamsModule } from 'src/database/entities/inside-teams/inside-teams.module';
import { MessageModule } from 'src/database/entities/message/message.module';
import { ChannelModule } from 'src/database/entities/channel/channel.module';

@Module({
  imports: [
    RoleModule,
    forwardRef(() => DiscordModule),
    EmojiModule,
    InsideTeamsModule,
    MessageModule,
    ChannelModule,
  ],
  providers: [
    InsideService,
    manageMembersService,
    teamsCompositionService,
  ],
  exports: [
    InsideService,
    manageMembersService,
    teamsCompositionService,
  ],
})
export class InsideModule {}
