import { Injectable } from "@nestjs/common";
import { RoleService } from "src/database/entities/role/role.service";
import { DiscordService } from "../discord.service";
import { EmojiService } from "src/database/entities/emoji/emoji.service";
import { ConfigService } from "@nestjs/config";
import { CacheType, ChatInputCommandInteraction, EmbedBuilder, GuildMember } from "discord.js";
import { handleAdminInsideCreateTeamBoardDto } from "../commands/dtos/handle-inside-team-board.dto";
import { InsideTeamsService } from "src/database/entities/inside-teams/inside-teams.service";
import { MessageService } from "src/database/entities/message/message.service";
import { InsideTeamEntity } from "src/database/entities/inside-teams/entities/inside-team.entity";
import { ChannelService } from "src/database/entities/channel/channel.service";
import { MessageEntity } from "src/database/entities/message/entities/message.entity";
import { ApexAccountService } from "src/database/entities/apex-account/apex-account.service";

@Injectable()
export class teamsCompositionService {

    constructor (
        private readonly roleService: RoleService,
        private readonly discordService: DiscordService,
        private readonly emojiService: EmojiService,
        private readonly configService: ConfigService,
        private readonly insideTeamsService: InsideTeamsService,
        private readonly messageService: MessageService,
        private readonly channelService: ChannelService,
        private readonly apexAccountService: ApexAccountService,
    ) {}

    public async handleAdminCreateInsideTeamBoard (interaction: ChatInputCommandInteraction<CacheType>, options: handleAdminInsideCreateTeamBoardDto) {
        await interaction.deferReply({
            ephemeral: true,
        });

        options.channel = options.channel ?? interaction.channel;

        const messageChannel = await this.channelService.findByDiscordId(options.channel.id);

        if (!messageChannel) {
            interaction.editReply(`## :x: Podany kanał nie jest zapisany w bazie danych.\nDodaj kanał do bazy danych i spróbuj ponownie.`)
            return;
        }

        const dbTeam = await this.insideTeamsService.findByName(`pla${options.team}`);
        const insideEmoji = await this.emojiService.findByName(`plainside`);

        if (!dbTeam) {
            console.error(`Couldn't find team pla${options.team} in database.`);
            interaction.editReply(`## :x: Wystąpił błąd.`);
            return;
        }

        interaction.editReply(`## ${insideEmoji} Tworzenie nowej autoaktualizowanej tablicy drużyny ${dbTeam.displayName} na kanale ${options.channel}...`);

        const teamBoardEmbed = await this.getInsideTeamBoardEmbed(dbTeam);

        const message = await this.discordService.sendMessage(options.channel.id, ``, [teamBoardEmbed]);

        const dbMessage = this.messageService.create({
            discordId: message.id,
            name: `insideteamboard-${dbTeam.name}`,
            channelId: messageChannel.id,
        });

        if (!dbMessage) {
            console.error(`Couldn't save inside team board to database.`);
            interaction.editReply(`## :x: Wystąpił błąd podczas zapisywania wysłanej tablicy drużyny.`);
        }

        interaction.editReply(`## ${insideEmoji} Tworzenie nowej tablicy drużyny zakończone sukcesem :white_check_mark:`)
    }

    public async handleAdminUpdateInsideTeamBoards (interaction: ChatInputCommandInteraction<CacheType>) {
        await interaction.deferReply({
            ephemeral: true,
        });

        const insideEmoji = await this.emojiService.findByName(`plainside`);

        interaction.editReply(`## ${insideEmoji} Aktualizowanie tablic drużyn PLA Inside...`);

        const updateAmount = await this.updateInsideTeamBoards();

        if (updateAmount === 0) {
            interaction.editReply(`## ${insideEmoji} Nie istnieją tablice drużyn do zaktualizowania...`);
            return;
        }

        if (!updateAmount) {
            console.error(`Something went wrong while trying to update inside team boards (${updateAmount})`);
            interaction.editReply(`## :x: Wystąpił błąd podczas aktualizacji tablic drużyn PLA Inside`)
            return;
        }

        interaction.editReply(`## ${insideEmoji} Zaktualizowano ${updateAmount} tablic drużyn PLA Inside :white_check_mark:`)
    }

    public async updateInsideTeamBoards (): Promise<number> {
        let updateAmount = 0;

        const insideTeams = await this.insideTeamsService.findAll();

        const boardEmbeds = [];

        for (const key in insideTeams) {
            const insideTeam: InsideTeamEntity = insideTeams[key];

            const teamBoards = await this.messageService.findByNames(`insideteamboard-${insideTeam.name}`);

            for (const subKey in teamBoards) {
                const board: MessageEntity = teamBoards[subKey];

                const boardEmbed = boardEmbeds[insideTeam.name] ?? await this.getInsideTeamBoardEmbed(insideTeam);
                boardEmbeds[insideTeam.name] = boardEmbed;

                const message = await this.discordService.getMessage(board.channel.discordId, board.discordId);

                if (!message) {
                    this.messageService.delete(board.id);
                    console.info(`Removed message ${board.id} (${board.name}) from database because it couldn't be found on discord.`);
                    continue;
                }

                message.edit({
                    embeds: [boardEmbed],
                });

                updateAmount++;
            }
        }

        return updateAmount;
    }

    private async getInsideTeamBoardEmbed (team: InsideTeamEntity) {
        const embed = new EmbedBuilder();

        console.info(`Creating inside team board embed: `, team.name);

        // Todo: do it properly and make team.role.emoji available
        const teamEmoji = (await this.roleService.findById(team.role.id)).emoji;

        console.info(team);

        embed.setAuthor({
            name: `PLA Inside`,
            iconURL: this.configService.get<string>(`images.pla-inside-logo`),
        });

        let description = [
            `# ${teamEmoji} <@&${team.role.discordId}>`,
            ``,
        ];

        const captainRole = await this.roleService.findByName('plainsidecaptain');
        const reserveRole = await this.roleService.findByName('plainsidereserve');
        const recruiterRole = await this.roleService.findByName('plainsiderecruiter');
        const adminRole = await this.roleService.findByName('admin');
        const moderatorRole = await this.roleService.findByName('moderator');
        const supportRole = await this.roleService.findByName('support');
        
        const teamMembers = await this.discordService.getUsersWithRole(team.role.discordId);

        const disconnectedEmoji = await this.emojiService.findByName(`disconnected`);
        const rankToRoleNameDictionary = this.apexAccountService.rankToRoleNameDictionary;
        const rankToDisplayNameDictionary = this.apexAccountService.rankToDisplayNameDictionary;
        const rankDivToRomanDictionary = this.apexAccountService.rankDivToRomanDictionary;

        if (teamMembers.size == 0) {
            description.push(`### :mag_right: Rekrutacja otwarta`)
        } else {
            description = [
                ...description,
                `## Skład drużyny:`
            ]

            let membersList = {
                captain: ``,
                members: ``,
                reserve: ``,
            }

            let normalMemberCount = 0;

            for (const [key, teamMember] of teamMembers.entries()) {
                const isCaptain = !!teamMember.roles.cache.has(captainRole.discordId);
                const isReserve = !!teamMember.roles.cache.has(reserveRole.discordId);
                const isRecruiter = !!teamMember.roles.cache.has(recruiterRole.discordId);
                const isAdmin = !!teamMember.roles.cache.has(adminRole.discordId);
                const isModerator = !!teamMember.roles.cache.has(moderatorRole.discordId);
                const isSupport = !!teamMember.roles.cache.has(supportRole.discordId);

                let memberText = ``;

                const apexAccount = await this.apexAccountService.findByUserDiscordId(teamMember.id);

                console.info(`Apex account: `, apexAccount);

                // Add rank emoji if user has apex account
                if (!apexAccount) {
                    memberText += `- ${disconnectedEmoji}`;
                } else {
                    const rankEmoji = await this.emojiService.findByName(rankToRoleNameDictionary[apexAccount.rankName]);

                    memberText += `- ${rankEmoji}`;
                }

                // Add recruiter role if user is recruiter
                if (isRecruiter) {
                    memberText += recruiterRole.emoji.toString();
                }

                // Add staff role if user is staff
                const isStaff = isAdmin || isModerator || isSupport;
                if (isStaff) {
                    const staffRole = isAdmin ? adminRole : isModerator ? moderatorRole : supportRole;

                    memberText += staffRole.emoji.toString();
                }

                memberText += ` ${teamMember}\n`;


                if (isCaptain) {
                    membersList.captain += memberText;
                }
                else if (isReserve) {
                    membersList.reserve += memberText;
                }
                else {
                    normalMemberCount++;
                    membersList.members += memberText;
                }
            }

            if (membersList.captain.length != 0)
                description.push(`### Kapitan:\n${membersList.captain.trim()}`);
            if (membersList.members.length != 0)
                description.push(`### Członkowie:\n${membersList.members.trim()}`);
            if (membersList.reserve.length != 0)
                description.push(`### Rezerwa:\n${membersList.reserve.trim()}`);

            if (normalMemberCount < 2) {
                description.push(`\n### :mag_right: Rekrutacja otwarta`);
            }
        }

        embed.setDescription(description.join(`\n`));

        embed.setImage(team.logoUrl);

        embed.setTimestamp();

        embed.setColor(`#${team.color}`);

        embed.setFooter({
            text: `Polskie Legendy Apex`,
            iconURL: this.configService.get<string>(`images.logo-transparent`),
        });

        return embed;
    }

}