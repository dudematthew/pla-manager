import { Injectable } from '@nestjs/common';
import { Client, TextChannel, ChannelType, User, GuildMember, PermissionsBitField, Guild, UserResolvable, PermissionResolvable, Channel } from 'discord.js';

@Injectable()
export class DiscordService {
    constructor(
        private readonly client: Client
    ) {}
    
    async sendMessage(channelId: string, message: string): Promise<void> {
      const channel = await this.client.channels.fetch(channelId);
      if (channel.type === ChannelType.GuildText) {
        const textChannel = channel as TextChannel;
        await textChannel.send(message);
      } else {
        throw new Error('Channel is not a text channel');
      }
    }

    /**
     * Get a user by their ID
     * @param userId The ID of the user
     * @returns The user
     */
    async getUserById(userId: string): Promise<User> {
      return await this.client.users.fetch(userId);
    }

    /**
     * Check if a user exists
     * @param userId The ID of the user
     * @returns Whether the user exists
     */
    async userExists(userId: string): Promise<boolean> {
      return await this.getUserById(userId) !== null;
    }


    /**
     * Check if a user has given rights
     * @param userId The ID of the user
     * @returns Whether the user has given rights
     */
    async userHasRights(userId: string, rights: PermissionResolvable): Promise<boolean> {
      // Get main guild from env variable
      const guild: Guild = this.client.guilds.cache.get(process.env.MAIN_GUILD_ID);

      // Get member from guild
      const member: GuildMember = await guild.members.fetch(userId);

      // Check if member has admin rights
      return member.permissions.has(rights);
    }

    /**
     * Get channel by ID
     * @param channelId The ID of the channel
     */
    async getChannelById(channelId: string): Promise<Channel> {
      return await this.client.channels.fetch(channelId) as TextChannel;
    }
}
