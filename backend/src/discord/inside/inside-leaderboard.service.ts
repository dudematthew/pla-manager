import {
    Injectable
} from "@nestjs/common";
import {
    CacheType,
    ChannelType,
    ChatInputCommandInteraction,
    EmbedBuilder
} from "discord.js";
import {
    ApexAccountService
} from "src/database/entities/apex-account/apex-account.service";
import {
    EmojiService
} from "src/database/entities/emoji/emoji.service";
import {
    DiscordService
} from "../discord.service";
import {
    InsideTeamsService
} from "src/database/entities/inside-teams/inside-teams.service";
import { handleAdminInsideCreateTeamBoardDto } from "../commands/dtos/handle-inside-team-board.dto";
import { AdminCreateInsideLeaderboardDto } from "../commands/dtos/admin-create-inside-leaderboard.dto";
import { ConfigService } from "@nestjs/config";
import { MessageService } from "src/database/entities/message/message.service";
import { ChannelService } from "src/database/entities/channel/channel.service";

@Injectable()
export class InsideLeaderboardService {
    constructor(
        private readonly emojiService: EmojiService,
        private readonly insideTeamService: InsideTeamsService,
        private readonly apexAccountService: ApexAccountService,
        private readonly discordService: DiscordService,
        private readonly configService: ConfigService,
        private readonly messageService: MessageService,
        private readonly channelService: ChannelService,
    ) {}

    public async handleAdminCreateInsideLeaderboard(interaction: ChatInputCommandInteraction<CacheType>, options: AdminCreateInsideLeaderboardDto) {
        await interaction.deferReply({
            ephemeral: true
        });

        // Set channel to current channel if not provided
        options.channel = options.channel ?? interaction.channel;

        if (options.channel.type !== ChannelType.GuildText) {
            console.error(`Provided channel is not text based`);
            interaction.editReply(`## :x: Podany kanał nie jest kanałem tekstowym.`);
            return;
        }

        // Check if channel is registered in database
        const dbChannel = await this.channelService.findByDiscordId(options.channel.id);

        if (!dbChannel) {
            console.error(`Channel ${options.channel.id} is not registered in database`);
            interaction.editReply(`## :x: Kanał ${options.channel} nie jest zarejestrowany w bazie danych.`);
            return;
        }

        const insideEmoji = await this.emojiService.findByName(`plainside`);

        interaction.editReply(`${insideEmoji} Tworzenie tablicy wyników PLA Inside...`);

        console.log(`Leaderboard message type: ${options.type}`);

        let leaderboardMessage;

        switch (options.type) {
            case `lp-team`:
                leaderboardMessage = await this.getTeamLeaderboardMessage();
                break;
            case `lp-member`:
                leaderboardMessage = await this.getMemberLeaderboardMessage();
                break;
            default:
                console.error(`Invalid leaderboard type provided: ${options.type}`);
                interaction.editReply(`## :x: Ten typ tablicy wyników nie jest jeszcze obsługiwany.`);
                return;
        }

        if (!leaderboardMessage) {
            console.error(`Failed to create PLA Inside leaderboard message`);
            return interaction.editReply(`Nie udało się utworzyć tablicy wyników PLA Inside.`);
        }

        console.log(`Sending leaderboard message to channel ${options.channel.id}`);
            
        const message = await options.channel.send(leaderboardMessage);

        if (!message) {
            console.error(`Failed to send leaderboard message`);
            interaction.editReply(`## :x: Nie udało się wysłać tablicy wyników PLA Inside.`);
            return;
        }

        // Check if message is already registered in database
        const existingMessage = await this.messageService.findByDiscordId(message.id);

        // If message exist, replace it
        if (existingMessage) {
            console.log(`Message ${message.id} already exist in database, replacing...`);
            await this.messageService.delete(existingMessage.id);
        }

        // Save message to database
        const savedMessage = await this.messageService.create({
            discordId: message.id,
            name: `insideleaderboard-${options.type}`,
            channelId: dbChannel.id,
        });

        if (!savedMessage) {
            console.error(`Failed to save leaderboard message to database`);
            interaction.editReply(`## :x: Nie udało się zapisać tablicy wyników PLA Inside do bazy danych.`);
            return;
        }

        interaction.editReply(`### :white_check_mark: Tablica wyników PLA Inside została utworzona: ${message.url}`);
    }

    /**
     * Get team leaderboard message
     * @warning May return null if something went wrong
     * @returns 
     */
    public async getTeamLeaderboardMessage() {
        const teamsData = this.getTeamsData();

        const placementEmojis = {
            1: await this.emojiService.findByName(`first`),
            2: await this.emojiService.findByName(`second`),
            3: await this.emojiService.findByName(`third`),
        }

        // Sort teams by summary score
        const sortedTeams = Object.values(teamsData).sort((a, b) => {
            return b.summaryScore - a.summaryScore;
        });

        const embed = await this.getBasicEmbed();
        let leaderboardMessage = ``;

        let i = 1;
        for (const team of sortedTeams) {
            let prefix = i === 1 ? `# ​` : i === 2 ? `## ​` : i === 3 ? `### ​` : `### ​`;
            prefix += placementEmojis[i] ?? `#${i}`;

            leaderboardMessage += prefix + ` ${team.emoji} **${team.team.displayName}** - ${team.summaryScore} LP\n`;
            i++;
        }

        embed.setTitle(`TOP LP Drużyn PLA Inside`);
        embed.setDescription(leaderboardMessage);

        return {
            embeds: [embed],
        }
    }

    private async getTeamsData () {
        const teams = await this.insideTeamService.findAll();
        const teamsData = [];

        for (const team of teams) {
            console.log(`Team inside ${team.name}:`, team.role);
            const teamRole = await this.discordService.getRoleById(team.role.discordId);
            const teamMembers = await this.discordService.getUsersWithRole(teamRole.id);

            teamsData[team.name] = {
                team,
                teamRole,
                members: [],
                emoji: team.role.emoji,
                summaryScore: 0,
            };

            for (const [key, member] of teamMembers) {
                const account = await this.apexAccountService.findByUserDiscordId(member.id);

                if (account) {
                    teamsData[team.name].members.push({
                        member,
                        account,
                    });

                    teamsData[team.name].summaryScore += account.rankScore;
                } else {
                    console.log(`Account not found for user ${member.id}`);
                }
            }
        }

        return teamsData;
    }
    
    private async getMemberLeaderboardMessage() {
        const teamsData = await this.getTeamsData();
        const membersData = [];
        const rankToRoleNameDictionary = this.apexAccountService.rankToRoleNameDictionary;

        const placementEmojis = {
            1: await this.emojiService.findByName(`first`),
            2: await this.emojiService.findByName(`second`),
            3: await this.emojiService.findByName(`third`),
        }

        // Get all members
        for (const teamData of Object.values(teamsData)) {
            for (const memberData of teamData.members) {
                membersData.push(memberData);
            }
        }

        console.info(`Members data:`, membersData);

        // Sort members by rank score
        const sortedMembers = membersData.sort((a, b) => {
            return b.account.rankScore - a.account.rankScore;
        });

        const embed = await this.getBasicEmbed();
        let leaderboardMessage = ``;

        let i = 1;
        for (const member of sortedMembers) {
            let prefix = i === 1 ? `# ​` : i === 2 ? `## ​` : i === 3 ? `### ​` : `### ​`;
            prefix += placementEmojis[i] ?? `#${i}`;

            const rankEmoji = await this.emojiService.findByName(rankToRoleNameDictionary[member.account.rankName]);

            prefix += ` ${rankEmoji} `;

            leaderboardMessage += prefix + `${member.member} - ${member.account.rankScore} LP\n`;
            i++;
        }

        embed.setTitle(`TOP LP Graczy PLA Inside`);
        embed.setDescription(leaderboardMessage);

        console.log(`Leaderboard message:`, leaderboardMessage, leaderboardMessage.length);

        return {
            embeds: [embed],
        }
    }

    private async getBasicEmbed (): Promise<EmbedBuilder> {
        const embed = new EmbedBuilder();

        embed.setColor(this.configService.get('theme.color-primary'));
        embed.setTimestamp();
        embed.setFooter({
            text: `Polskie Legendy Apex`,
            iconURL: this.configService.get<string>('images.logo-transparent'),
        });
        embed.setAuthor({
            name: `PLA Inside`,
            iconURL: this.configService.get<string>('images.pla-inside-logo'),
        })

        return embed;
    }
}