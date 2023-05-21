import { Module } from '@nestjs/common';
import { EmojiService } from './emoji.service';
import { forwardRef } from '@nestjs/common';
import { DiscordModule } from 'src/discord/discord.module';

@Module({
  imports: [
    forwardRef(() => DiscordModule),
    // TypeOrmModule.forFeature([UserEntity, ApexAccountEntity]),
  ],
  providers: [EmojiService]
})
export class EmojiModule {}
