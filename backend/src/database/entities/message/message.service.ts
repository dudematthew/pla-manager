import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiscordService } from 'src/discord/discord.service';
import { MessageEntity } from './entities/message.entity';
import { ChannelType, Message } from 'discord.js';
import { Channel } from 'diagnostics_channel';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { ChannelService } from '../channel/channel.service';

/**
 * Note: await entityManager.insert(Child, { parent: { id: 1 } as Parent });
 */
@Injectable()
export class MessageService {

    private readonly logger = new Logger(MessageService.name);

    constructor(
        @InjectRepository(MessageEntity)
        private readonly messageRepository: Repository<MessageEntity>,
        private readonly discordService: DiscordService,
        private readonly channelService: ChannelService,
    ) {}

    /**
     * Find a channel by its ID
     * @param id The ID of the channel
     * @returns The channel
     */
    async findById(id: number): Promise<MessageEntity> {
        return await this.messageRepository.findOne({
            where: { id },
            relations: ['channel'],
        })
    }

    /**
     * Find a channel by its Discord ID
     * @param discordId The Discord ID of the channel
     * @returns The channel
     */
    async findByDiscordId(discordId: string): Promise<MessageEntity> {
        return await this.messageRepository.findOne({
          where: { discordId },
          relations: ['channel'],
      });
    }

    async findByName(name: string): Promise<MessageEntity> {
        return await this.messageRepository.findOne({
          where: { name },
          relations: ['channel'],
      });
    }

    async create(message: CreateMessageDto): Promise<MessageEntity> {

        // If channel doesn't exist in database, abort
        const channel = await this.channelService.findById(message.channelId);

        if (!channel) {
            console.log(`Channel ${message.channelId} does not exist in database`);
            return null;
        }

        // If channel doesn't exist on Discord, abort
        if (!await this.discordService.channelExists(channel.discordId)) {
            console.log(`Channel ${channel.discordId} does not exist on Discord`);
            return null;
        }

        // If message already exists in database, abort
        if (await this.findByName(message.name)) {
            console.log(`Message ${message.name} already exists in database`);
            return null;
        }

        // If message doesn't exist on Discord, abort
        console.log(`Checking if message ${message.discordId} exists on Discord`);
        if (!await this.discordService.messageExists(channel.discordId, message.discordId)) {
            console.log(`User ${message.discordId} does not exist on Discord`);
            return null;
        }

        const newMessage = await this.messageRepository.create({
            name: message.name,
            discordId: message.discordId,
            channel: channel,
        });

        return await this.messageRepository.save(newMessage);
    }

    async update(messageId, message: UpdateMessageDto): Promise<MessageEntity> {
            const dbMessage = await this.findById(messageId);

            console.log(`Updating message ${dbMessage.name} (${dbMessage.discordId})`);
    
            if (!dbMessage)
                return null;
    
            const updatedMessage = this.messageRepository.merge(dbMessage, message);
    
            return await this.messageRepository.save(updatedMessage);       
    }

    async getDiscordMessageByName(name: string): Promise<Message<true>> {

        const dbMessage = await this.findByName(name);

        if (!dbMessage || !dbMessage?.channel)
            return null;

        const message = await this.discordService.getMessage(dbMessage.channel.discordId, dbMessage.discordId);

        if (!message)
            return null;

        return message as Message<true>;
    }
}
