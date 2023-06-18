import { Module, forwardRef } from '@nestjs/common';
import { IntroduceService } from './introduce.service';
import { DiscordService } from '../discord.service';
import { DiscordModule } from '../discord.module';
import { MessageModule } from 'src/database/entities/message/message.module';
import { UserModule } from 'src/database/entities/user/user.module';
import { ChannelModule } from 'src/database/entities/channel/channel.module';

@Module({
  imports: [
    forwardRef(() => DiscordModule),
    MessageModule,
    UserModule,
    ChannelModule,
  ],
  providers: [IntroduceService],
  exports: [IntroduceService]
})
export class IntroduceModule {}
