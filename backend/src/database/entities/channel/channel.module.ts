import { Module } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { DiscordModule } from 'src/discord/discord.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelEntity } from './channel.entity';
import { forwardRef } from '@nestjs/common';

@Module({
    imports: [
        TypeOrmModule.forFeature([ChannelEntity]),
        forwardRef(() => DiscordModule),
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
