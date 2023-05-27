import { Injectable, Logger } from '@nestjs/common';
import { ButtonInteraction, CacheType, ChatInputCommandInteraction, Client, Collection, Embed, EmbedBuilder, GuildEmoji, GuildMember } from 'discord.js';
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
    member: GuildMember;
    isCaptain: boolean;
}

export interface InsideMembersGroup {
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

    // Role ids
    private insideRoleId: string;
    private insideReserveRoleId: string;
    private insideTeamRoleIds: string[];
    private insideCaptainRoleId: string;

    // User pages amount
    private readonly usersPerPage = 10;

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
        this.insideCaptainRoleId = await this.roleService.findByName(this.configService.get<string>('role-names.pla-inside.captain')).then(role => role.discordId);
    }

    public async handleGetInsideMembers(interaction: ChatInputCommandInteraction<CacheType>) {

        const insideMembers = await this.getInsideMembers();
        const insideTeamMembersGroup = await this.getInsideMembersGroup(insideMembers, 'team');
        const insideReserveMembersGroup = await this.getInsideMembersGroup(insideMembers, 'reserve');
        const insideWithoutMembersGroup = await this.getInsideMembersGroup(insideMembers, 'without');

        const insideTeams = [
            this.getTeamFromGroup(insideTeamMembersGroup, 'y'),
        ]

        console.log(insideTeams);

        const insideTeamMembersPaginated = this.paginateInsideMembers(insideTeamMembersGroup);
        const insideReserveMembersPaginated = this.paginateInsideMembers(insideReserveMembersGroup);
        const insideWithoutMembersPaginated = this.paginateInsideMembers(insideWithoutMembersGroup);
        
        const insideTeamMembersEmbed = await this.getInsideMembersEmbed(insideTeamMembersPaginated, 'Lista członków PLA Inside należących do drużyny');
        const insideReserveMembersEmbed = await this.getInsideMembersEmbed(insideReserveMembersPaginated, 'Lista członków PLA Inside należących do rezerwy');
        const insideWithoutMembersEmbed = await this.getInsideMembersEmbed(insideWithoutMembersPaginated, 'Lista członków PLA Inside nie należących do żadnej drużyny');


        const pagesNumbers = {
            insideTeamMembersPage: 0,
            insideReserveMembersPage: 0,
            insideWithoutMembersPage: 0,
        };

        const menuPageButton = (currentMenu) => {
            return new Row([
                new MenuOption(
                    {
                        label: "Członkowie w drużynach",
                        description: "Członkowie którzy należą do jednej z drużyn PLA Inside",
                        value: "teams",
                        default: currentMenu == 'insideTeamMembers',
                        emoji: "👥",
                    },
                    'insideTeamMembers'
                ),
                new MenuOption(
                    {
                        label: "Członkowie w rezerwie",
                        description: "Członkowie którzy należą do rezerwy PLA Inside",
                        value: "reserves",
                        default: currentMenu == 'insideReserveMembers',
                        emoji: "👤",
                    },
                    'insideReserveMembers'
                ),
                new MenuOption(
                    {
                        label: "Członkowie bez drużyny i poza rezerwą",
                        description: "Członkowie którzy nie należą do żadnej drużyny i nie są w rezerwie",
                        value: "others",
                        default: currentMenu == 'insideWithoutMembers',
                        emoji: "👽",
                    },
                    'insideWithoutMembers'
                ),
            ], RowTypes.SelectMenu)
        };

        const changePageHandler = (i: ButtonInteraction<CacheType>, pagesAmountKey: string, pages: EmbedBuilder[], buttonType: 'next' | 'previous') => {
            console.log(`Changing page to ${buttonType}: `, pagesNumbers[pagesAmountKey], pages.length, buttonType);

            i.deferUpdate();
            // Change page number but check if it's not less than 0 and not more than pages amount
            pagesNumbers[pagesAmountKey] = buttonType == 'previous' ? pagesNumbers[pagesAmountKey] - 1 < 0 ? pages.length - 1 : pagesNumbers[pagesAmountKey] - 1 : pagesNumbers[pagesAmountKey] + 1 > pages.length - 1 ? 0 : pagesNumbers[pagesAmountKey] + 1;

            // replace embed with new one
            i.message.edit({
                embeds: [
                    pages[pagesNumbers[pagesAmountKey]]
                ]
            })
        }

        const createPageButtons = (name: string, teamMembersEmbeds: EmbedBuilder[]) => {
            return [
                new ButtonOption(
                    {
                        type: ComponentType.Button,
                        customId: `${name}PreviousPage`,
                        style: ButtonStyle.Primary,
                        label: "◀"
                    },
                    (i) => changePageHandler(i, `${name}Page`, teamMembersEmbeds, 'previous')
                ),
                new ButtonOption(
                    {
                        type: ComponentType.Button,
                        customId: `${name}NextPage`,
                        style: ButtonStyle.Primary,
                        label: "▶"
                    },
                    (i) => changePageHandler(i, `${name}Page`, teamMembersEmbeds, 'next')
                )
            ];
        }

        const menu = new Menu(interaction.channel, interaction.user.id, [
            {
                name: 'insideTeamMembers',
                content: insideTeamMembersEmbed[0],
                rows: (() => { 
                    const rows = [
                        menuPageButton('insideTeamMembers'),
                    ];

                    // Add page buttons if there is more than one page
                    if (insideTeamMembersEmbed.length > 1)
                        rows.push(
                            new Row(
                                createPageButtons('insideTeamMembers', insideTeamMembersEmbed), 
                                RowTypes.ButtonMenu
                            )
                        );
                    return rows;
                })()
            },
            {
                name: "insideReserveMembers",
                content: insideReserveMembersEmbed[0],
                rows: (() => { 
                    const rows = [
                        menuPageButton('insideReserveMembers'),
                    ];

                    // Add page buttons if there is more than one page
                    if (insideReserveMembersEmbed.length > 1)
                        rows.push(
                            new Row(
                                createPageButtons('insideReserveMembers', insideReserveMembersEmbed), 
                                RowTypes.ButtonMenu
                            )
                        );
                    return rows;
                })()
            },
            {
                name: "insideWithoutMembers",
                content: insideWithoutMembersEmbed[0],
                rows: (() => { 
                    const rows = [
                        menuPageButton('insideWithoutMembers'),
                    ];

                    // Add page buttons if there is more than one page
                    if (insideWithoutMembersEmbed.length > 1)
                        rows.push(
                            new Row(
                                createPageButtons('insideTeamMembers', insideWithoutMembersEmbed), 
                                RowTypes.ButtonMenu
                            )
                        );
                    return rows;
                })()
            }
        ]);

        menu.start();
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
    private async getInsideMembersGroup(insideMembers: Collection<String, GuildMember>, type: 'team' | 'reserve' | 'without'): Promise<InsideMembers[]> {

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

                        const emoji = (dbRole?.emoji == null) ? insideEmoji : await this.discordService.getServerEmojiByName(dbRole.emoji.name);

                        return {
                            id: member.id,
                            fullName: `${member.user.username}#${member.user.discriminator}`,
                            emoji: emoji,
                            member: member,
                            isCaptain: member.roles.cache.some(role => role.id === this.insideCaptainRoleId),                        }
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
                            member: member,
                            isCaptain: false,
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
                            member: member,
                            isCaptain: false,
                        }
                    });
                break;
        }

        return insideMembersGroup;
    }

    /**
     * Gets inside members and paginates them
     * @param insideMembers 
     * @returns paginated inside members
     */
    public paginateInsideMembers(insideMembersGroup: InsideMembersGroup[]) {

        // Paginate into an array of 10 members
        const insideMembersGroupPaginated = insideMembersGroup.reduce((resultArray, item, index) => {
            const chunkIndex = Math.floor(index / this.usersPerPage)

            if (!resultArray[chunkIndex]) {
                resultArray[chunkIndex] = []
            }

            resultArray[chunkIndex].push(item)

            return resultArray
        }, []);

        return insideMembersGroupPaginated;
    }

    public async getTeamFromGroup(insideMembers: InsideMembers[], teamSuffix: string) {
        const teamRole = await this.roleService.findByName(this.configService.get<string>('role-names.pla-inside.team.prefix') + teamSuffix);

        console.log("teamRole", teamRole);

        const teamMembers = insideMembers.filter(member => member.member.roles.cache.some(role => role.id === teamRole.discordId));

        console.log("teamMembers", teamMembers);

        return teamMembers;
    }

    /**
     * Creates embeds for inside members
     * @param membersPages paginated inside members
     * @param title embed title
     * @returns paginated inside members embeds
     */
    public async getInsideMembersEmbed(membersPages: InsideMembers[][], title: string): Promise<EmbedBuilder[]> {

        const insideMembersEmbeds: EmbedBuilder[] = [];

        for (let i = 0; i < membersPages.length; i++) {

            const members = membersPages[i];

            // Get page number
            const pageNumber = i + 1;

            const membersString = members.map(member => {
                return `${member.emoji} <@${member.id}> (${member.fullName})`;
            }).join('\n');

            const insideMembersEmbed = new EmbedBuilder()
                .setTitle(title)
                .setColor(this.configService.get('theme.color-primary'))
                .setTimestamp()
                .setAuthor({
                    name: 'Polskie Legendy Apex',
                    iconURL: this.configService.get('images.logo-transparent')
                })
                .setDescription(membersString)
                .setFooter({
                    text: `Strona ${pageNumber}/${membersPages.length}`,
                });

            insideMembersEmbeds.push(insideMembersEmbed);
        }

        return insideMembersEmbeds;
    }

}
