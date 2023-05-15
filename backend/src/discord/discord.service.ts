import { Injectable } from '@nestjs/common';
import { Client, TextChannel, ChannelType, User, GuildMember, PermissionsBitField, Guild, UserResolvable, PermissionResolvable, Channel, ReactionEmoji, GuildEmoji, VoiceChannel, VoiceBasedChannel } from 'discord.js';
import { Logger } from '@nestjs/common';

@Injectable()
export class DiscordService {

  /**
  * The logger instance
  */
  private readonly logger = new Logger(DiscordService.name);

  constructor(
      private readonly client: Client
  ) {}
  
  async sendMessage(channelId: string, content: string, embeds: any[] = [], components: any[] = []): Promise<void> {
    const channel = await this.client.channels.fetch(channelId);
    if (channel.type !== ChannelType.GuildVoice) {
      const textChannel = channel as TextChannel;
      await textChannel.send({
        content,
        embeds,
        components,
      });
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
   * Check if a role exists
   * @param roleId The ID of the role
   * @returns Whether the role exists
   */
  async roleExists(roleId: string): Promise<boolean> {
    // Get main guild from env variable
    const guild: Guild = this.client.guilds.cache.get(process.env.MAIN_GUILD_ID);
    
    // Get role from guild
    const role = await guild.roles.fetch(roleId);

    // Check if role exists
    return role !== null;
  }

  /**
   * Get channel by ID
   * @param channelId The ID of the channel
   */
  async getChannelById(channelId: string): Promise<Channel> {
    return await this.client.channels.fetch(channelId) as TextChannel;
  }

  /**
   * Get channel by name
   * @param channelName The name of the channel
   * @returns The channel
   */
  async getChannelByName(channelName: string): Promise<Channel> {
    // Get main guild from env variable
    const guild: Guild = this.client.guilds.cache.get(process.env.MAIN_GUILD_ID);

    // Get channel from guild
    return await guild.channels.cache.find(channel => channel.name === channelName);
  }

  /**
   * Check if a channel exists
   * @param channelId The ID of the channel
   * @returns Whether the channel exists
   */
  async channelExists(channelId: string): Promise<boolean> {
    return await this.getChannelById(channelId) !== null;
  }

  async getServerEmojiByName(emojiName: string): Promise<GuildEmoji> {
    // Get main guild from env variable
    const guild: Guild = this.client.guilds.cache.get(process.env.MAIN_GUILD_ID);

    // Get emoji from guild
    const emoji = await guild.emojis.cache.find(emoji => emoji.name === emojiName);

    // Check if emoji exists
    if (emoji === null) {
      this.logger.error(`Emoji ${emojiName} does not exist`);
    }

    return emoji;
  }

  /**
   * Get the emoji code
   * @param emoji The emoji
   * @returns 
   */
  public getEmojiCode(emoji: GuildEmoji): string {
    const emojiCode = emoji.animated ? `<a:${emoji.name}:${emoji.id}>` : `<:${emoji.name}:${emoji.id}>`;
    console.log("Emoji code: ", emojiCode);
    return emojiCode;
  }

  public getUserVoiceChannel(userId: string): VoiceBasedChannel {
    // Get main guild from env variable
    const guild: Guild = this.client.guilds.cache.get(process.env.MAIN_GUILD_ID);

    // Get member from guild
    const member: GuildMember = guild.members.cache.get(userId);

    // Get voice channel of member
    const voiceChannel = member.voice.channel;

    // Check if member is in a voice channel
    if (voiceChannel === null) {
      return null;
    }

    return voiceChannel;
  }
}
