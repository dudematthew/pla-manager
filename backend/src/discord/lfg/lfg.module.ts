import { Module, forwardRef } from '@nestjs/common';
import { LfgService } from './lfg.service';
import { RoleModule } from 'src/database/entities/role/role.module';
import { DiscordModule } from '../discord.module';
import { ChannelModule } from 'src/database/entities/channel/channel.module';
import { EmojiModule } from 'src/database/entities/emoji/emoji.module';
import { ApexAccountModule } from 'src/database/entities/apex-account/apex-account.module';

@Module({
  imports: [
    RoleModule,
    ChannelModule,
    EmojiModule,
    forwardRef(() => DiscordModule),
    ApexAccountModule,
  ],
  providers: [
    LfgService,
  ],
  exports: [
    LfgService,
  ]
})
export class LfgModule {}
