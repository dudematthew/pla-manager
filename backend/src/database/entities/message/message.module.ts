import { Module, forwardRef } from '@nestjs/common';
import { MessageService } from './message.service';
import { DiscordModule } from 'src/discord/discord.module';
import { MessageEntity } from './entities/message.entity';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { ChannelModule } from '../channel/channel.module';

@Module({
  imports: [
    forwardRef(() => DiscordModule),
    TypeOrmModule.forFeature([MessageEntity]),
    ChannelModule,
  ],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
