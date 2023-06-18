import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChannelEntity } from './channel.entity';
import { DiscordService } from 'src/discord/discord.service';

@Injectable()
export class ChannelService {

    constructor(
        @InjectRepository(ChannelEntity)
        private readonly channelRepository: Repository<ChannelEntity>,
        private readonly discordService: DiscordService,
    ) {}

    /**
     * Find a channel by its ID
     * @param id The ID of the channel
     * @returns The channel
     */
    async findById(id: number): Promise<ChannelEntity> {
        return await this.channelRepository.findOne({
            where: { id },
            relations: [
                'messages'
            ]
        });
    }

    /**
     * Find a channel by its Discord ID
     * @param discordId The Discord ID of the channel
     * @returns The channel
     */
    async findByDiscordId(discordId: string): Promise<ChannelEntity> {
        return await this.channelRepository.findOne({
            where: { discordId },
            relations: [
                'messages'
            ]
        });
    }

    async findByName(name: string): Promise<ChannelEntity> {
        return await this.channelRepository.findOne({
            where: { name },
            relations: [
                'messages'
            ]
        });
    }

    async update(id: number, properties: any): Promise<ChannelEntity> {
        const channel = await this.findById(id);
        if (!channel) {
            return null;
        }

        if (properties.name) {
            channel.name = properties.name;
        }

        if (properties.discordId) {
            // If channel doesn't exist on Discord, abort
            console.log(`Checking if channel ${properties.discordId} exists on Discord`);
            if (!await this.discordService.channelExists(properties.discordId)) {
                console.log(`Channel ${properties.discordId} does not exist on Discord`);
                return null;
            }

            channel.discordId = properties.discordId;
        }

        return await this.channelRepository.save(channel);
    }
}
