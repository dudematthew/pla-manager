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
import { UserEntity } from '../user/user.entity';
import { UserService } from '../user/user.service';

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
        private readonly userService: UserService,
    ) {}

    /**
     * Find a message by its ID
     * @param id The ID of the channel
     * @returns The channel
     */
    async findById(id: number): Promise<MessageEntity> {
        return await this.messageRepository.findOne({
            where: { id },
            relations: [
                'channel',
                'user'
            ],
        })
    }

    /**
     * Find a message by its Discord ID
     * @param discordId The Discord ID of the channel
     * @returns The channel
     */
    async findByDiscordId(discordId: string): Promise<MessageEntity> {
        return await this.messageRepository.findOne({
          where: { discordId },
          relations: [
            'channel',
            'user'
        ],
      });
    }

    async findByName(name: string): Promise<MessageEntity> {
        return await this.messageRepository.findOne({
          where: { name },
          relations: [
            'channel',
            'user'
        ],
      });
    }

    async findByUserId(userId: number): Promise<MessageEntity[]> {
        return await this.messageRepository.find({
            where: {
                user: {
                    id: userId
                }
            },
            relations: [
                'channel',
                'user'
            ],
        });
    }

    async findByUserIdAndName(userId: number, name: string): Promise<MessageEntity> {
        return await this.messageRepository.findOne({
            where: {
                user: {
                    id: userId
                },
                name
            },
            relations: [
                'channel',
                'user'
            ],
        });
    }

    async create(message: CreateMessageDto, userId: UserEntity["id"] = null): Promise<MessageEntity> {

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
        if (await this.findByDiscordId(message.discordId)) {
            console.log(`Message ${message.name} already exists in database`);
            return null;
        }

        // If message doesn't exist on Discord, abort
        console.log(`Checking if message ${message.discordId} exists on Discord`);
        if (!await this.discordService.messageExists(channel.discordId, message.discordId)) {
            console.log(`User ${message.discordId} does not exist on Discord`);
            return null;
        }

        const user = (!!userId) ? await this.userService.findById(userId) : null;

        // If user doesn't exist in database, abort
        if (!!userId && !user) {
            console.log(`User ${userId} does not exist in database`);
            return null;
        }

        const newMessage = await this.messageRepository.create({
            name: message.name,
            discordId: message.discordId,
            channel: channel,
            user: user,
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

    async delete(messageId: number): Promise<boolean> {
        const dbMessage = await this.findById(messageId);

        if (!dbMessage)
            return false;

        console.log(`Deleting message ${dbMessage.name} (${dbMessage.discordId})`);

        await this.messageRepository.delete(dbMessage.id);

        return true;
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
