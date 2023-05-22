import { Injectable, Logger } from '@nestjs/common';
import { CacheType, ChatInputCommandInteraction, Client, Collection, EmbedBuilder, GuildEmoji, GuildMember } from 'discord.js';
import { DiscordService } from '../discord.service';
import { ConfigService } from '@nestjs/config';
import { RoleService } from 'src/database/entities/role/role.service';
import { EmojiService } from 'src/database/entities/emoji/emoji.service';
import { ButtonOption, Menu, MenuOption, Row, RowTypes } from 'discord.js-menu-buttons';
import { ButtonStyle } from 'discord.js';
import { ComponentType } from 'discord.js';

export interface InsideMembers {
    id: string;
    fullName: string;
    emoji: string | GuildEmoji;
}

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
        private readonly emojiService: EmojiService,
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
        const insideTeamMembersGroup = await this.getInsideMembersGroup(insideMembers, 'team');
        const insideReserveMembersGroup = await this.getInsideMembersGroup(insideMembers, 'reserve');
        const insideWithoutMembersGroup = await this.getInsideMembersGroup(insideMembers, 'without');
        
        const insideTeamMembersEmbed = await this.getInsideMembersEmbed(insideTeamMembersGroup, 'Lista członków PLA Inside należących do drużyny');
        const insideReserveMembersEmbed = await this.getInsideMembersEmbed(insideReserveMembersGroup, 'Lista członków PLA Inside należących do rezerwy');
        const insideWithoutMembersEmbed = await this.getInsideMembersEmbed(insideWithoutMembersGroup, 'Lista członków PLA Inside nie należących do żadnej drużyny');

        const menu = new Menu(interaction.channel, interaction.user.id, [
            {
                name: 'insideTeamMembers',
                content: insideTeamMembersEmbed,
                rows: [
                    new Row([
                        new ButtonOption(
                            {
                                type: ComponentType.Button,
                                customId: "insideTeamMembersPreviousPage",
                                style: ButtonStyle.Primary,
                                label: "◀"
                            },
                            (i) => {
                                i.deferUpdate();
                                console.log("Clicked button1 " + i.customId)

                                // replace embed with new one
                                i.message.edit({
                                    embeds: [
                                        new EmbedBuilder()
                                            .setTitle("New title")
                                            .setDescription("New description")
                                            .setColor(this.configService.get('theme.color-primary'))
                                            .setTimestamp()
                                            .setAuthor({
                                                name: 'Polskie Legendy Apex',
                                                iconURL: this.configService.get('images.logo')
                                            })
                                    ]
                                })
                            }
                        ),
                        new ButtonOption(
                            {
                                type: ComponentType.Button,
                                customId: "insideTeamMembersNextPage",
                                style: ButtonStyle.Primary,
                                label: "▶"
                            },
                            (i) => {
                                i.deferUpdate();
                                console.log("Clicked button1 " + i.customId)
                                
                            }
                        )
                    ], RowTypes.ButtonMenu),
                    new Row([
                        new MenuOption(
                            {
                                label: "Członkowie w drużynach",
                                description: "Członkowie którzy należą do jednej z drużyn PLA Inside",
                                value: "teams",
                                default: true,
                                emoji: "👥",
                            },
                            'insideTeamMembers'
                        ),
                        new MenuOption(
                            {
                                label: "Członkowie w rezerwie",
                                description: "Członkowie którzy należą do rezerwy PLA Inside",
                                value: "reserves",
                                emoji: "👤",
                            },
                            'insideReserveMembers'
                        ),
                        new MenuOption(
                            {
                                label: "Członkowie bez drużyny i poza rezerwą",
                                description: "Członkowie którzy nie należą do żadnej drużyny i nie są w rezerwie",
                                value: "others",
                                emoji: "👽",
                            },
                            'insideWithoutMembers'
                        ),
                    ], RowTypes.SelectMenu),
                    // new Row([
                    //     new MenuOption(
                    //         {
                    //             label: "label",
                    //             description: "description",
                    //             value: "val"
                    //         },
                    //         "page2"
                    //     )
                    // ], RowTypes.SelectMenu)
                ]
            },
            {
                name: "insideReserveMembers",
                content: insideReserveMembersEmbed,
                rows: [
                    new Row([
                        new MenuOption(
                            {
                                label: "label1",
                                value: "value1",
                            },
                            (i) => {
                                i.deferUpdate();
                                console.log(i.values[0]);
                            }
                        ),
                        new MenuOption(
                            {
                                label: "go to page1",
                                value: "value2"
                            },
                            "page1"
                        )
                    ], RowTypes.SelectMenu)
                ]
            },
            {
                name: "insideWithoutMembers",
                content: insideReserveMembersEmbed,
                rows: [
                    new Row([
                        new MenuOption(
                            {
                                label: "label1",
                                value: "value1",
                            },
                            (i) => {
                                i.deferUpdate();
                                console.log(i.values[0]);
                            }
                        ),
                        new MenuOption(
                            {
                                label: "go to page1",
                                value: "value2"
                            },
                            "page1"
                        )
                    ], RowTypes.SelectMenu)
                ]
            }
        ]);

        menu.start();

        // interaction.reply({
        //     embeds: [
        //         insideTeamMembersEmbed,
        //         insideReserveMembersEmbed,
        //         insideWithoutMembersEmbed,
        //     ]
        // })
    }

    /**
     * Get all members from the inside role
     * @returns All members from the inside role
     */
    private async getInsideMembers() {
        // Get role id from database
        const insideRole = await this.roleService.findByName(this.configService.get<string>('role-names.pla-inside.main'));

        // Get all members from the inside role
        return await this.discordService.getUsersWithRole(insideRole.discordId);
    }

    /**
     * Create return message
     */
    private async getInsideMembersGroup(insideMembers: Collection<String, GuildMember>, type: 'team' | 'reserve' | 'without') {

        const insideEmoji = await this.emojiService.getDiscordEmojiByName('plainside');

        let insideMembersGroup: InsideMembers[] = [];

        switch (type) {
            case 'team':
                insideMembersGroup = await Promise.all(insideMembers
                    .filter(member => member.roles.cache.some(role => this.insideTeamRoleIds.includes(role.id)))
                    .map(async member => {
                        // Check which team member is in
                        const teamRole = member.roles.cache.find(role => this.insideTeamRoleIds.includes(role.id));

                        const dbRole = await this.roleService.findByDiscordId(teamRole.id);

                        console.log(dbRole);

                        const emoji = await this.discordService.getServerEmojiByName(dbRole.emoji.discordName);

                        return {
                            id: member.id,
                            fullName: `${member.user.username}#${member.user.discriminator}`,
                            emoji: emoji,
                        }
                    }));
                break;

            case 'reserve':
                insideMembersGroup = insideMembers
                    .filter(member => member.roles.cache.some(role => role.id === this.insideReserveRoleId))
                    .map(member => {
                        return {
                            id: member.id,
                            fullName: `${member.user.username}#${member.user.discriminator}`,
                            emoji: insideEmoji,
                        }
                    });
                break;
            
            case 'without':
                insideMembersGroup = insideMembers
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
                break;
        }

        return insideMembersGroup;
    }

    public async getInsideMembersEmbed(members: InsideMembers[], title: string) {

        console.log(`Inside members: `, members);

        // Paginate members 

        const membersString = members.map(member => {
            return `${member.emoji} <@${member.id}> (${member.fullName})`;
        }).join('\n');

        const insideMembersEmbed = new EmbedBuilder()
            .setTitle(title)
            .setColor(this.configService.get('theme.color-primary'))
            .setTimestamp()
            .setAuthor({
                name: 'Polskie Legendy Apex',
                iconURL: this.configService.get('images.logo')
            })

        // Add fields for two groups
        if (members.length > 0) {
            insideMembersEmbed.addFields({
                name: '\u200B',
                value: membersString,
                inline: true,
            });
        }

        return insideMembersEmbed;
    }

}
