import { Module } from '@nestjs/common';
import { GiveawayService } from './giveaway.service';
import { UserModule } from 'src/database/entities/user/user.module';
import { ChannelModule } from 'src/database/entities/channel/channel.module';
import { GiveawayMemberModule } from 'src/database/entities/giveaway-member/giveaway-member.module';
import { RoleModule } from 'src/database/entities/role/role.module';
import { TwitchApiService } from './twitch-api.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    UserModule,
    ChannelModule,
    GiveawayMemberModule,
    HttpModule,
  ],
  providers: [
    GiveawayService,
    TwitchApiService,
  ],
  exports: [GiveawayService],
})
export class GiveawayModule {}
