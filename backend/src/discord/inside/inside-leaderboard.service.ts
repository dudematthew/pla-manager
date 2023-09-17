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
import { RoleService } from "src/database/entities/role/role.service";

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
        private readonly roleService: RoleService,
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

    public async handleAdminUpdateInsideLeaderboards(interaction: ChatInputCommandInteraction<CacheType>) {
        await interaction.deferReply({
            ephemeral: true
        });

        const insideEmoji = await this.emojiService.findByName(`plainside`);

        let progressMessage = `## ${insideEmoji} Aktualizacja tablic wyników PLA Inside...`

        interaction.editReply(progressMessage);

        const leaderboardTypes = {
            'lp-team': `Drużynowa LP`,
            'lp-member': `Graczy LP`,
        }

        for (const [key, type] of Object.entries(leaderboardTypes)) {
            console.log(`Updating leaderboard ${type}`);
            progressMessage += `\n### - Aktualizacja tablicy: ${type}`;
            interaction.editReply(progressMessage);
            const success = await this.updateInsideLeaderboards(key);

            if (!success) {
                progressMessage += ` (:x: Niepowodzenie)`;
                interaction.editReply(progressMessage);
            }
            else {
                progressMessage += ` (:white_check_mark: Sukces)`;
                interaction.editReply(progressMessage);
            }
        }

        progressMessage += `\n### ${insideEmoji} Aktualizacja tablicy wyników PLA Inside zakończona.`;
        interaction.editReply(progressMessage);
    }

    public async updateInsideLeaderboards(type: string) {
        console.log(`Starting to update inside leaderboards`);
        const dbMessage = await this.messageService.findByName(`insideleaderboard-${type}`);

        if (!dbMessage) {
            console.error(`Message ${type} not found in database`);
            return false;
        }

        const message = await this.discordService.getMessage(dbMessage.channel.discordId, dbMessage.discordId);

        if (!message) {
            console.error(`Message ${type} not found in discord, deleting...`);
            this.messageService.delete(dbMessage.id);
            return false;
        }

        let newMessage;

        switch (type) {
            case `lp-team`:
                newMessage = await this.getTeamLeaderboardMessage();
                break;
            case `lp-member`:
                newMessage = await this.getMemberLeaderboardMessage();
                break;
            default:
                console.error(`Invalid leaderboard type provided: ${type}`);
                return false;
        }

        if (!newMessage) {
            console.error(`Failed to update message ${type}`);
            return false;
        }

        console.log(`Updating message ${type} with id ${message.id} and channel ${message.channel.id}`);

        await message.edit(newMessage);

        return true;
    }

    /**
     * Get team leaderboard message
     * @warning May return null if something went wrong
     * @returns 
     */
    public async getTeamLeaderboardMessage() {
        console.log(`Starting to get team leaderboard message`);
        const teamsData = await this.getTeamsData();

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
        embed.setFooter({
            text: `Polskie Legendy Apex • Gracze rezerwowi nie są uwzględniani w sumie LP`,
            iconURL: this.configService.get<string>('images.logo-transparent'),
        })

        return {
            embeds: [embed],
        }
    }

    private async getTeamsData () {
        const teams = await this.insideTeamService.findAll();
        const teamsData = [];

        for (const team of teams) {
            const teamRole = await this.discordService.getRoleById(team.role.discordId);
            const teamMembers = await this.discordService.getUsersWithRole(teamRole.id);
            const reserveRole = await this.roleService.findByName(this.configService.get<string>('role-names.pla-inside.reserve'));
            const reserveMembers = await this.discordService.getUsersWithRole(reserveRole.discordId);

            // Filter out reserve members
            for (const [key, member] of reserveMembers) {
                teamMembers.delete(key);
            }

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
        console.log(`Starting to get member leaderboard message`);
        const membersData = [];
        const dbRole = await this.roleService.findByName(this.configService.get<string>('role-names.pla-inside.main'));
        const members = await this.discordService.getUsersWithRole(dbRole.discordId);
        const rankToRoleNameDictionary = this.apexAccountService.rankToRoleNameDictionary;

        const placementEmojis = {
            1: await this.emojiService.findByName(`first`),
            2: await this.emojiService.findByName(`second`),
            3: await this.emojiService.findByName(`third`),
        }

        // Get all members data 
        for (const [key, member] of members) {
            const account = await this.apexAccountService.findByUserDiscordId(member.id);

            if (account) {
                membersData.push({
                    member,
                    account,
                });
            }
            else {
                console.log(`Account not found for user ${member.nickname}`);
            }
        }

        console.info(`Members data:`, membersData);

        // Sort members by rank score
        const sortedMembers = membersData.sort((a, b) => {
            return b.account.rankScore - a.account.rankScore;
        });

        // Dump to console sorted members
        console.info(`Sorted members:`, sortedMembers);

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

        console.log(`Leaderboard message:`, leaderboardMessage);

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