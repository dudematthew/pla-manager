import { Module } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { DiscordModule } from 'src/discord/discord.module';
import { DatabaseModule } from 'src/database/database.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelEntity } from './channel.entity';

@Module({
    imports: [
        DiscordModule,
        DatabaseModule,
        TypeOrmModule.forFeature([ChannelEntity]),
    ],
    controllers: [],
    providers: [
        ChannelService,
    ],
    exports: [
        ChannelService,
    ],
})
export class ChannelModule {}
