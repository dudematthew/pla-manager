import { Injectable } from '@nestjs/common';
import { Client, TextChannel, ChannelType } from 'discord.js';

@Injectable()
export class DiscordService {
    constructor(
        private readonly client: Client
    ) {}
    
    async sendMessage(channelId: string, message: string): Promise<void> {
      const channel = await this.client.channels.fetch(channelId);
      if (channel.type === ChannelType.GuildText) {
        const textChannel = channel as TextChannel;
        textChannel.send(message);
      } else {
        throw new Error('Channel is not a text channel');
      }
    }

    async getUserById(userId: string): Promise<any> {
      try {
        return await this.client.users.fetch(userId);
      } catch (e) {
        return null;
      }
    }

    async userExists(userId: string): Promise<boolean> {
      return await this.getUserById(userId) !== null;
    }

}
