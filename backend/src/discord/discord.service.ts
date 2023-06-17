import { Injectable } from '@nestjs/common';
import { Client, TextChannel, ChannelType, User, GuildMember, PermissionsBitField, Guild, UserResolvable, PermissionResolvable, Channel, ReactionEmoji, GuildEmoji, VoiceChannel, VoiceBasedChannel, Role, Collection, EmbedBuilder, Embed, MessageCreateOptions, ComponentBuilder, APIActionRowComponent, Message, ApplicationCommandManager, GuildApplicationCommandManager } from 'discord.js';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { setClient } from 'discord.js-menu-buttons';
import { RoleGroupService } from 'src/database/entities/role-group/role-group.service';
import { RoleService } from 'src/database/entities/role/role.service';
import { RoleEntity } from 'src/database/entities/role/entities/role.entity';
import { RoleGroupEntity } from 'src/database/entities/role-group/entities/role-group.entity';
import { ApexAccountService } from 'src/database/entities/apex-account/apex-account.service';
import { MessageOptions } from 'child_process';
import { BaseCommandMeta, CommandDiscovery, CommandsService } from 'necord';

@Injectable()
export class DiscordService {

  /**
   * The ID of the main guild
   */
  public readonly guildId: string;

  /**
   * Main guild
   */
  public guild: Guild;

  /**
  * The logger instance
  */
  private readonly logger = new Logger(DiscordService.name);

  constructor(
      private readonly client: Client,
      private readonly configService: ConfigService,
      private readonly roleGroupService: RoleGroupService,
      private readonly roleService: RoleService,
      private readonly apexAccountService: ApexAccountService,
      private readonly commandsService: CommandsService,
  ) {
    // Set main guild ID from env variable
    this.guildId = process.env.MAIN_GUILD_ID;

    
    this.init();
  }
  
  public async init() {
    await this.isReady();
    
    this.guild = await this.client.guilds.fetch(this.guildId);
    
    console.log(await this.getApplicationCommand('połącz'));


    const errorRedirect = (e) => {
      // List of errors to ignore
      const blacklistedErrors = [
        'ECONNREFUSED',
        'ENOTFOUND',
      ];
      
      // Log the error to the console
      this.logger.error(`${e} - ${e?.stack}`);
      
      // If the error is in the blacklist, send it to the log channel
      if (!blacklistedErrors.some(error => e.message.includes(error)))
        this.sendErrorToLogChannel(e);
    }

    // Send message to log channel on process uncaught exception
    process.on('uncaughtException', (e) => errorRedirect(e));
    
    process.on('unhandledRejection', (e) => errorRedirect(e as Error));

    this.logger.log('Discord client initialized!');
  }

  public isReady(): Promise<boolean> {
    const client = this.client;

    return new Promise((resolve, reject) => {
      if (client.isReady())
        resolve(true);

      client.on('ready', () => {
        resolve(true);
      });
    });
  }

  public async getApplicationCommands() {
    return await this.client.application.commands.fetch();
  }

  public async getApplicationCommand(name: string, subName?: string) {
    const commands = await this.getApplicationCommands();

    const command = commands.find(command => command.name === name);

    if (!subName)
      return command ?? null;

    else
      return command?.options?.find(option => option.name === subName);
      
  }


  public sendPrivateMessage(userId: string, content: string, embeds: MessageCreateOptions["embeds"] = [], components: MessageCreateOptions["components"] = [], files: MessageCreateOptions["files"] = []) {
    const user = this.client.users.cache.get(userId);
    
    user.send({
      content,
      embeds,
      components,
      files,
    });
  }

  public getClient(): Client {
    return this.client;
  }

  /**
   * Send error embed to log channel with error details
   */
  public sendErrorToLogChannel(error: Error) {
    const logChannelId = process.env.DISCORD_LOG_CHANNEL_ID;
    const mainAdminId = process.env.DISCORD_MAIN_ADMIN_ID;

    if (!logChannelId || !mainAdminId)
      return;

    console.log(`Sending error to log channel: ${logChannelId}`);

    const content = `<@${mainAdminId}>`;

    const embed = new EmbedBuilder()
      .setTitle('✋ Błąd krytyczny')
      .setDescription(`**Bot zakończył działanie z następującym błędem:** \n\n\`${error.message}\``)
      .setColor('#ff0000')
      .setAuthor({
        name: 'PLA Manager',
        iconURL: this.configService.get<string>('images.logo-transparent'),
      })
      .setFooter({
        text: error.name,
        iconURL: this.configService.get<string>('images.danger'),
      })
      .setTimestamp();

    try {
      embed.addFields(
        {
          name: 'Stack trace',
          value: `\`\`\`${error?.stack}\`\`\``,
        },
        {
          name: 'Cause',
          value: `\`\`\`${error?.cause}\`\`\``,
        }
      );
    } catch (e) {
      this.logger.error(`Couldn't log error details to embed: ${e}`);

      embed.addFields(
        {
          name: 'Nie udało się pobrać szczegółów błędu:',
          value: `\`\`\`${e}\`\`\``,
        },
      );
    }
    
    this.sendMessage(logChannelId, content, [embed]);
  }

  private async cache(element: 'members' | 'roles' | 'channels') {
    switch (element) {
      case 'members':
        await this.guild.members.fetch();
        break;
      case 'roles':
        await this.guild.roles.fetch();
        break;
      case 'channels':
        await this.guild.channels.fetch();
        break;
    }
  }
  
  async sendMessage(channelId: Channel["id"], content: string, embeds: EmbedBuilder[] = [], components: any[] = []): Promise<Message> {
    const channel = await this.client.channels.fetch(channelId);

    const options: MessageCreateOptions = {};

    if (content)
      options.content = content;

    options.embeds = embeds;
    options.components = components;

    let message: Message;

    if (channel.type !== ChannelType.GuildVoice) {
      const textChannel = channel as TextChannel;
      message = await textChannel.send(options);
    } else {
      throw new Error('Channel is not a text channel');
    }

    return message;
  }

  async messageExists(channelId: Channel["id"], messageId: Message["id"]): Promise<boolean> {
    return this.getMessage(channelId, messageId) !== null;
  }

  async getMessage(channelId: Channel["id"], messageId: Message["id"]): Promise<Message> {
    const channel = await this.getChannelById(channelId);

    if (!channel)
      return null;

    if (channel.type !== ChannelType.GuildVoice) {
      const textChannel = channel as TextChannel;
      try {
        const message = await textChannel.messages.fetch(messageId);
        return message;
      } catch (e) {
        return null;
      }
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
   * Get a member by their ID
   * @param userId The ID of the user
   * @returns The member
   */
  async getMemberById(userId: string): Promise<GuildMember> {
    return await this.guild.members.fetch(userId);
  }

  /**
   * Check if a user exists
   * @param userId The ID of the user
   * @returns Whether the user exists
   */
  async userExists(userId: string): Promise<boolean> {
    return await this.getUserById(userId) !== null;
  }

  async memberExists(userId: string): Promise<boolean> {
    return await this.getMemberById(userId) !== null;
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
    return await this.getRoleById(roleId) !== null;
  }

  /**
   * Get role by ID
   * @param roleId The ID of the role
   * @returns The role
   */
  async getRoleById(roleId: string): Promise<Role> {
    // Get role from guild
    return await this.guild.roles.fetch(roleId);
  }

  /**
   * Get user with given role id
   * @param roleId The ID of the role
   * @returns The user with given role id
   */
  async getUsersWithRole(roleId: string): Promise<Collection<string, GuildMember>> {

    console.log('getting users role by id...');
    const role = await this.getRoleById(roleId);
    console.log('got users role by id');

    return (await this.guild.members.fetch()).filter(member => member.roles.cache.has(role.id));
  }


  /**
   * Get channel by ID
   * @param channelId The ID of the channel
   */
  async getChannelById(channelId: string): Promise<Channel> {
    // Get channel but not from cache
    console.log(`getting channel by id ${channelId}...`);
    return await this.client.channels.fetch(channelId);
  }

  /**
   * Get channel by name
   * @param channelName The name of the channel
   * @returns The channel
   */
  async getChannelByName(channelName: string): Promise<Channel> {
    // Get channel from guild
    return await this.guild.channels.cache.find(channel => channel.name === channelName);
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
    // Get emoji from guild
    const emoji = await this.guild.emojis.cache.find(emoji => emoji.name === emojiName);

    // Check if emoji exists
    if (emoji === null) {
      this.logger.error(`Emoji ${emojiName} does not exist`);
    }

    return emoji;
  }

  async serverEmojiExists(emojiName: string): Promise<boolean> {
    return await this.getServerEmojiByName(emojiName) !== null;
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

  /**
   * Get rank role of user
   * @param userId 
   * @returns 
   */
  async getUserRankRole(userId: string): Promise<Role> {

    const rankRoles: Role[] = await this.roleGroupService.findAllDiscordRolesByGroupName(this.configService.get<string>('role-group-names.rank'));

    const user = await this.guild.members.fetch(userId);

    const userRoles = user.roles.cache;

    const userRankRole = userRoles.find(role => rankRoles.some(rankRole => rankRole.id === role.id));

    return userRankRole;
  }

  // async getUsersWithRankRole() {
  //   const rankRoles = 
  // }

  public getUserVoiceChannel(userId: string): VoiceBasedChannel {
    // Get member from guild
    const member: GuildMember = this.guild.members.cache.get(userId);

    // Get voice channel of member
    const voiceChannel = member.voice.channel;

    // Check if member is in a voice channel
    if (voiceChannel === null) {
      return null;
    }

    return voiceChannel;
  }

  /**
   * Switch role from given group to another role from the same group
   * and remove the old role
   */
  public async switchRoleFromGroup(userId: User["id"], roleGroupName: RoleGroupEntity["name"], roleToSwitchId: Role["id"]) {

    // Get all roles from given group
    const roleGroupRoles = await this.roleGroupService.findAllRolesByGroupName(roleGroupName);

    // Get role to switch
    const roleToSwitch = roleGroupRoles.find(role => role.discordId === roleToSwitchId);

    // Remove all roles from group
    await this.removeRolesFromUser(userId, roleGroupRoles.map(role => role.discordId));

    // Add new role
    await this.addRoleToUser(userId, roleToSwitch.discordId);
  }

  public async removeGroupRoles(userId: User["id"], roleGroupName: RoleGroupEntity["name"]) {
    // Get all roles from given group
    const roleGroupRoles = await this.roleGroupService.findAllRolesByGroupName(roleGroupName);

    // Remove all roles from group
    await this.removeRolesFromUser(userId, roleGroupRoles.map(role => role.discordId));
  }

  public async removeRoleFromUser(userId: User["id"], roleId: Role["id"]) {
    // Get member from guild
    const member: GuildMember = this.guild.members.cache.get(userId);

    // Get role from guild
    const role: Role = await this.guild.roles.fetch(roleId);

    // Remove role from member
    await member.roles.remove(role);
  }

  public async removeRolesFromUser(userId: User["id"], roleIds: Role["id"][]) {
    // Get member from guild
    const member: GuildMember = this.guild.members.cache.get(userId);

    // Get roles from guild
    const roles: Role[] = roleIds.map(roleId => this.guild.roles.cache.get(roleId));

    // Remove roles from member
    await member.roles.remove(roles);
  }

  public async addRoleToUser(userId: User["id"], roleId: Role["id"]) {
    // Get member from guild
    const member: GuildMember = this.guild.members.cache.get(userId);

    // Get role from guild
    const role: Role = await this.guild.roles.fetch(roleId);

    // Add role to member
    await member.roles.add(role);
  }
}
