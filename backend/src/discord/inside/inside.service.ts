import { Injectable, Logger } from '@nestjs/common';
import { CacheType, ChatInputCommandInteraction, Collection, EmbedBuilder, GuildMember } from 'discord.js';
import { DiscordService } from '../discord.service';
import { ConfigService } from '@nestjs/config';
import { RoleService } from 'src/database/entities/role/role.service';
// import { sendPaginatedEmbeds } from 'discord.js-embed-pagination';

@Injectable()
export class InsideService {

    /**
     * The logger instance
     */
    private readonly logger = new Logger(InsideService.name);

    private insideRoleId: string;
    private insideReserveRoleId: string;
    private insideTeamRoleIds: string[];

    constructor(
        private readonly discordService: DiscordService,
        private readonly configService: ConfigService,
        private readonly roleService: RoleService,
    ) {
        this.init();
    }

    private async init() {
        this.insideRoleId = await this.roleService.findByName(this.configService.get<string>('role-names.pla-inside.main')).then(role => role.discordId);
        this.insideReserveRoleId = await this.roleService.findByName(this.configService.get<string>('role-names.pla-inside.reserve')).then(role => role.discordId);
        this.insideTeamRoleIds = await this.roleService.getAllInsideRoles().then(roles => roles.map(role => role.discordId));
    }

    public async handleGetInsideMembers(interaction: ChatInputCommandInteraction<CacheType>) {

        const insideMembers = await this.getInsideMembers();
        const insideMembersEmbed = await this.getInsideMembersEmbed(insideMembers);

        interaction.reply({
            embeds: [insideMembersEmbed]
        })
    }

    /**
     * Get all members from the inside role
     * @returns All members from the inside role
     */
    private async getInsideMembers() {
        // Get role id from database
        const insideRoleId = (
            await this.roleService.findByName(this.configService.get<string>('role-names.pla-inside.main'))
        )?.discordId;

        // Get all members from the inside role
        return await this.discordService.getUsersWithRole(insideRoleId);
    }

    /**
     * Create return message
     */
    private async getInsideMembersEmbed(insideMembers: Collection<String, GuildMember>) {
        const insideMembersEmbed = new EmbedBuilder()
            .setTitle('Lista członków PLA Inside')
            .setColor(this.configService.get('theme.color-primary'))
            .setTimestamp()
            .setAuthor({
                name: 'Polskie Legendy Apex',
                iconURL: this.configService.get('images.logo')
            });

        const insideEmoji = await this.discordService.getServerEmojiByName('plainside');

        const membersWithoutTeam = insideMembers
            .filter(member => {
                return !member.roles.cache.some(role => this.insideTeamRoleIds.includes(role.id))
                    && !member.roles.cache.some(role => role.id === this.insideReserveRoleId);
            })
            .map(member => {
                return {
                    id: member.id,
                    fullName: `${member.user.username}#${member.user.discriminator}`,
                    emoji: insideEmoji,
                }
            });

        const membersInReserve = insideMembers
            .filter(member => member.roles.cache.some(role => role.id === this.insideReserveRoleId))
            .map(member => {
                return {
                    id: member.id,
                    fullName: `${member.user.username}#${member.user.discriminator}`,
                    emoji: insideEmoji,
                }
            });

        const membersWithTeam = insideMembers
            .filter(member => member.roles.cache.some(role => this.insideTeamRoleIds.includes(role.id)))
            .map(member => {
                // Check which team member is in
                const teamRole = member.roles.cache.find(role => this.insideTeamRoleIds.includes(role.id));

                const emoji = teamRole.icon ?? insideEmoji;

                return {
                    id: member.id,
                    fullName: `${member.user.username}#${member.user.discriminator}`,
                    emoji: emoji,
                }
            });

        const membersWithoutTeamString = membersWithoutTeam.map(member => {
            return `${member.emoji} <@${member.id}> (${member.fullName})`;
        }).join('\n');
        const membersWithTeamString = membersWithTeam.map(member => {
            return `${member.emoji} <@${member.id}> (${member.fullName})`;
        }).join('\n');
        const membersInReserveString = membersInReserve.map(member => {
            return `${member.emoji} <@${member.id}> (${member.fullName})`;
        }).join('\n');

        // Add fields for two groups
        if (membersWithTeam.length > 0) {
            insideMembersEmbed.addFields({
                name: 'Członkowie z drużyną',
                value: membersWithTeamString,
                inline: false
            });
        }
        if (membersInReserve.length > 0) {
            insideMembersEmbed.addFields({
                name: 'Członkowie rezerwy',
                value: membersInReserveString,
                inline: false
            });
        }
        if (membersWithoutTeam.length > 0) {
            insideMembersEmbed.addFields({
                name: 'Pozostali członkowie',
                value: membersWithoutTeamString,
                inline: false
            });
        }

        return insideMembersEmbed;
    }

}
