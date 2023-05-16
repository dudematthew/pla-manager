import { Injectable, forwardRef } from '@nestjs/common';
import { MessageData } from '../discord.listeners';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { RoleService } from 'src/database/entities/role/role.service';
import { Cache } from 'cache-manager';
import { Logger } from '@nestjs/common';
import { DiscordService } from '../discord.service';
import { RoleEntity } from 'src/database/entities/role/entities/role.entity';
import { ColorResolvable, Embed, EmbedBuilder, GuildEmoji, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, APIActionRowComponent, APIMessageActionRowComponent, Channel, Role } from 'discord.js';
import { ConfigService } from '@nestjs/config';
import { ChannelService } from 'src/database/entities/channel/channel.service';
import { channel } from 'diagnostics_channel';

@Injectable()
export class LfgService {

    /**
     * The logger instance
     */
    private readonly logger = new Logger(LfgService.name);

    /**
     * The wildcard-match module
     */
    private readonly wcmatch: any;

    /**
     * The role types that are used in the lfg messages
     */
    private roleTypes = {
        bronze: [
            'bronze',
            'brąz',
            'bronz',
            'bronzu',
            'bronzem',
        ],
        silver: [
            'silver',
            'srebro',
            'srebrze',
        ],
        gold: [
            'gold',
            'goldem',
            'goldzie',
            'złoto',
            'złocie',
            'złotem',
            'złota',
            'złote',
        ],
        platinum: [
            'platinum',
            'platyna', 
            'platyny', 
            'platynie', 
            'platyno',
            'platyna', 
            'platyny',
            'platyna', 
            'platynie', 
            'platynę',
            'platyne',
            'platyno',
            'plat',
            'platy',
            'plata',
            'platem',
        ],
        diamond: [
            'diamond',
            'diament',
            'diamenta',
            'diamentem',
            'diax',
            'diaxem',
            'diaxa',
            'diaxy',
            'diaxiem',
            'diamenty',
            'diamentach',
            'diamentami',
        ],
        master: [
            'master',
            'mastera',
            'masterem',
        ],
        predator: [
            'predator',
            'predatorem',
            'predatora',
            'pred',
            'predy',
            'predem',
        ],
        pubs: [
            'puby',
            'pub',
            'pubach',
            'pubsy',
            'pubsach',
            'publiczne',
            'publicznych',
        ],
    }

    /**
     * The role relations that are used in the lfg messages
     */
    private roleRelations = {
        bronze: [
            'bronze',
            'silver',
            'gold',
        ],
        silver: [
            'bronze',
            'silver',
            'gold',
        ],
        gold: [
            'bronze',
            'silver',
            'gold',
            'platinum',
        ],
        platinum: [
            'bronze',
            'silver',
            'gold',
            'platinum',
            'diamond',
        ],
        diamond: [
            'bronze',
            'silver',
            'gold',
            'platinum',
            'diamond',
            'master',
        ],
        master: [
            'bronze',
            'silver',
            'gold',
            'platinum',
            'diamond',
            'master',
            'predator',
        ],
        predator: [
            'bronze',
            'silver',
            'gold',
            'platinum',
            'diamond',
            'master',
            'predator',
        ],
        rookie: [
            'bronze',
            'silver',
            'gold',
        ]
    }

    constructor(
        @Inject(CACHE_MANAGER)
        private readonly cache: Cache,
        @Inject(forwardRef(() => RoleService))
        private readonly roleService: RoleService,
        private readonly discordService: DiscordService,
        private readonly configService: ConfigService,
        private readonly channelService: ChannelService,
    ) {
        this.wcmatch = require('wildcard-match');
    }

    /**
     * Check if a value matches a pattern
     * 
     * Wildcard-match supports the following glob syntax in patterns:
     * [?] matches exactly one arbitrary character excluding separators
     * [*] matches zero or more arbitrary characters excluding separators
     * [**] matches any number of segments when used as a whole segment in a separated pattern
     * [\] escapes the following character making it be treated literally
     * 
     * @param value value to check
     * @param pattern pattern to check against
     * @returns true if value matches pattern, false otherwise
     */
    private matchPattern(value: string, pattern: string): boolean {
        return this.wcmatch(pattern)(value);
    }

    /**
     * This method handles the lfg message
     * It checks if the message contains any of the role types
     * and then creates a new lfg message that mentions mentioned roles
     * Every post is cached for 5 minutes to prevent spam
     * @param message 
     */
    public async handleLfgMessage(message: MessageData) { 

        // Check if the message is sent by a bot
        if (message.message.author.bot) {
            return;
        }

        console.log(`LFG message received: ${message.message.content}`);

        // Check if the message contains any of the role types
        const mentionedRoles = await this.getMentionedRoles(message);

        if(mentionedRoles.length === 0) {
            console.log('No roles mentioned');
            return;
        }

        // Check if the message is cached
        let userCacheData: any = await this.getCachedUserLfg(message.message.author.id);

        if(userCacheData) {
            this.reactWithTimeInfo(message);
            return;
        }

        // Cache the user lfg cooldown
        userCacheData = await this.setCachedUserLfg(message.message.author.id);

        // Get the lfg embed
        const embed = await this.getLfgEmbed(message, mentionedRoles, parseInt(userCacheData));
        
        let roleMentions = '';
        const globalCache = await this.getCachedGlobalLfg();

        // Get the user rank role
        const userRankRole = await this.discordService.getUserRankRole(message.message.author.id);
        const userRankRoleName = userRankRole.name.toLowerCase();
        
        // Check for each role if it's in a cachedCooldowns
        // If it is, then add the cooldown to the embed
        // If it's not, then add role mention
        for (const role of mentionedRoles) {

            const cooldown = globalCache[role.name];

            console.log(`Testing global cache for ${role.name} with cooldown: ${cooldown}`);

            if(cooldown) {
                console.log(`Global cache for ${role.name} is set: ${cooldown}`);

                // roleMentions += `${role.name.toUpperCase()} (<t:${cooldown}:R>) `;
                roleMentions += `${role.name.toUpperCase()} (⏱) `;

                continue;
            }

            // Check if the role can be mentioned
            if(!this.canMentionRole(userRankRoleName, role.name)) {
                console.log(`User ${message.message.author.username} with ${userRankRoleName} cannot mention role ${role.name}`);

                roleMentions += `${role.name.toUpperCase()} (👮‍♂️) `;

                continue;
            }

            console.log(`Global cache for ${role.name} is not set: ${cooldown}, setting it now`);

            this.setCachedGlobalLfg(role);
            roleMentions += `<@&${role.discordId}> `;
        }

        roleMentions += ` <@${message.message.author.id}>`

        // Get the user voice channel
        const voiceChannel = this.discordService.getUserVoiceChannel(message.message.author.id);
        let components: APIActionRowComponent<APIMessageActionRowComponent>[] = [];

        if(voiceChannel) {
            const button = new ButtonBuilder()
                .setLabel('Wejdź na kanał')
                .setStyle(ButtonStyle.Link)
                .setURL(voiceChannel.url)
                .setEmoji('🔊');
    
            const row = new ActionRowBuilder({
                components: [button],
            });

            components.push(row.toJSON() as APIActionRowComponent<APIMessageActionRowComponent>);
        } else {
            await this.reactWithMute(message);
        }

        // React to the message
        await this.reactToLfgMessage(message, mentionedRoles);

        const outputChannelId = await this.getLfgOutputChannelId();

        console.log("Sending message to channel: " + outputChannelId);

        // Send the embed to the channel
        this.discordService.sendMessage(outputChannelId, roleMentions, [embed], components);

    }

    private async getLfgOutputChannelId(): Promise<string> {
        const channel = await this.channelService.findByName(this.configService.get<string>('channel-names.lfg-output'));
        
        console.log(`CHANNEL THAT WAS FOUND BY ${this.configService.get<string>('channel-names.lfg-output')}: `, channel);

        return channel.discordId;
    }

    private async getLfgEmbed(message: MessageData, mentionedRoles: RoleEntity[], cooldownTimestamp: number) {
        const emojis = await this.getRoleEmojis(mentionedRoles);

        const embed = new EmbedBuilder()
            .setColor(this.configService.get<ColorResolvable>('theme.color-primary'))
            .setTitle(message.message.member.nickname)
            .setAuthor({
                name: 'LFG - Szukam graczy',
                iconURL: this.configService.get<string>('images.logo'),
            })
            .setURL(message.message.url)
            .setThumbnail(message.message.member.displayAvatarURL())
            .setDescription('*"' + message.message.content + '"*')
            .setTimestamp()
            .setFooter({
                text: `LFG`,
            });

        const voiceChannel = this.discordService.getUserVoiceChannel(message.message.author.id);

        if (voiceChannel)
            embed.addFields({
                name: '🔊 Kanał Głosowy',
                value: `<@${message.message.author.id}> jest teraz na \nkanale <#${voiceChannel.id}>!`,
            });
        
        embed.addFields(
            {
                name: '⏱ Cooldown',
                value: `<t:${cooldownTimestamp}:R>`
            }
        );

        return embed;
    }

    private canMentionRole(rankRole: string, mentionedRole: string): boolean {

        if(mentionedRole === 'pubs')
            return true;

        const availableRoleNamesToMention = this.roleRelations[rankRole];

        if(!availableRoleNamesToMention)
            return false;

        return availableRoleNamesToMention.includes(mentionedRole);
    }

    /**
     * Get the mentioned roles ids from the message
     * @param messageData
     * @returns 
     */
    private async getMentionedRoles(messageData: MessageData): Promise<RoleEntity[]> {
        const mentionedRoles: RoleEntity[] = [];
        const messageContent = messageData.message.content.toLowerCase();

        const rankRole = await this.discordService.getUserRankRole(messageData.message.author.id);

        // Check if the user has a rank role
        if(!rankRole)
            return mentionedRoles;

        /**
         * Loop through all the role types and check 
         * if the message contains any of the role types
         */
        outerLoop:
        for (const roleType in this.roleTypes) {
            for (let rolePattern of this.roleTypes[roleType]) {

                rolePattern = `**${rolePattern}**`;

                if (this.matchPattern(messageContent, rolePattern)) {
                    console.log(`Role ${roleType} mentioned in ${messageContent}`);
                    const role: RoleEntity = await this.getRoleFromDatabase(roleType);

                    if(!role)
                        continue outerLoop;

                    mentionedRoles.push(role);
                    continue outerLoop;
                }
            }
        }

        return mentionedRoles;
    }


    /**
     * Get the role from the database
     * @param message 
     * @param mentionedRoles 
     */
    private async reactToLfgMessage(message: MessageData, mentionedRoles: RoleEntity[]) {
        const emojis = await this.getRoleEmojis(mentionedRoles);

        console.log(`Reacting to message ${message.message.content} with ${emojis.length} emojis`);

        await message.message.react('📣');

        emojis.forEach(async (emoji) => {
            try {
                await message.message.react(emoji);
            } catch (error) {
                this.logger.error(`Failed to react to message ${message.message.content} with ${emoji}: ${error}`);
            }
        });
    }

    private async reactWithTimeInfo(message: MessageData) {
        await message.message.react('👀');
        await message.message.react('⏱');
    }

    private async reactWithMute(message: MessageData) {
        await message.message.react('🔇');
    }

    private async getRoleEmojis(mentionedRoles: RoleEntity[]) {
        const emojis: GuildEmoji[] = [];

        for(const role of mentionedRoles) {
            let emoji: GuildEmoji;

            try {
                emoji = await this.discordService.getServerEmojiByName(role.name);

                if(!emoji) {
                    this.logger.error(`Could not find emoji for role ${role.name}`);
                    return;
                }

                emojis.push(emoji);
            } catch (error) {
                this.logger.error(`Could not find emoji for role ${role.name}`);
            }
        }

        return emojis;
    }

    /**
     * Get the role from the database
     * @param roleName
     * @returns 
     */
    private async getRoleFromDatabase(roleName: string): Promise<RoleEntity> {
        const role = await this.roleService.findByName(roleName);

        if(!role) {
            this.logger.error(`Role ${roleName} not found in the database`);
            return null;
        }

        return role;
    }

    /**
     * Get limits for the lfg message
     * @returns
     */
    private async getCachedGlobalLfg() {
        let cacheData = {};

        for(const roleType in this.roleTypes) {
            cacheData[roleType] = await this.cache.get(`lfg-role-${roleType}`) || null;
        }

        return cacheData;
    }

    /**
     * Set limits for the lfg message
     * @param role 
     * @param ttl 
     * @returns time until expiration
     */
    private async setCachedGlobalLfg(role: RoleEntity, ttl: number = this.configService.get<number>('lfg.rank-cooldown')) {
        const timeUntilExpiration = Math.floor(Date.now() / 1000) + ttl;

        console.log(`Setting cache for role ${role.name} with key lfg-role-${role.name} for ${ttl} seconds`);

        await this.cache.set(`lfg-role-${role.name}`, timeUntilExpiration, ttl * 1000);

        return timeUntilExpiration;
    }

    /**
     * Get limits for the lfg message
     * @param userId 
     * @returns time until expiration
     */
    private async getCachedUserLfg(userId: string) {
        return await this.cache.get(`lfg-user-${userId}`) || null;
    }

    private async setCachedUserLfg(userId: string, ttl: number = this.configService.get<number>('lfg.post-cooldown')) {
        const timeUntilExpiration = Math.floor(Date.now() / 1000) + ttl;

        console.log(`Setting cache for user ${userId} with key lfg-user-${userId} for ${ttl} seconds`);

        await this.cache.set(`lfg-user-${userId}`, timeUntilExpiration, ttl * 1000);

        return timeUntilExpiration;
    }
}