import { Module } from '@nestjs/common';
import { EmojiService } from './emoji.service';
import { forwardRef } from '@nestjs/common';
import { DiscordModule } from 'src/discord/discord.module';
import { EmojiEntity } from './entities/emoji.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    forwardRef(() => DiscordModule),
    TypeOrmModule.forFeature([EmojiEntity]),
  ],
  providers: [EmojiService],
  exports: [EmojiService],
})
export class EmojiModule {}
