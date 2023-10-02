import { Module, forwardRef } from '@nestjs/common';
import { GiveawayService } from './giveaway.service';
import { UserModule } from 'src/database/entities/user/user.module';
import { ChannelModule } from 'src/database/entities/channel/channel.module';
import { GiveawayMemberModule } from 'src/database/entities/giveaway-member/giveaway-member.module';
import { RoleModule } from 'src/database/entities/role/role.module';
import { TwitchApiService } from './twitch-api.service';
import { HttpModule } from '@nestjs/axios';
import { DiscordModule } from '../discord.module';

@Module({
  imports: [
    UserModule,
    ChannelModule,
    GiveawayMemberModule,
    HttpModule,
    RoleModule,
    forwardRef(() => DiscordModule),
  ],
  providers: [
    GiveawayService,
    TwitchApiService,
  ],
  exports: [GiveawayService],
})
export class GiveawayModule {}
