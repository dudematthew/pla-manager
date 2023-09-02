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

@Injectable()
export class InsideLeaderboardService {
    constructor(
        private readonly emojiService: EmojiService,
        private readonly insideTeamService: InsideTeamsService,
        private readonly apexAccountService: ApexAccountService,
        private readonly discordService: DiscordService,
        private readonly configService: ConfigService,
    ) {}

    public async handleAdminCreateInsideLeaderboard(interaction: ChatInputCommandInteraction<CacheType>, options: AdminCreateInsideLeaderboardDto) {
        await interaction.deferReply({
            ephemeral: true
        });

        // Set channel to current channel if not provided
        options.channel = options.channel ?? interaction.channel;

        const insideEmoji = await this.emojiService.findByName(`plainside`);

        interaction.editReply(`${insideEmoji} Tworzenie tablicy wyników PLA Inside...`);

        const leaderboardMessage = await this.getTeamLeaderboardMessage();

        if (!leaderboardMessage) {
            console.error(`Failed to create PLA Inside leaderboard message`);
            return interaction.editReply(`Nie udało się utworzyć tablicy wyników PLA Inside.`);
        }

        if (options.channel.type !== ChannelType.GuildText) {
            console.error(`Provided channel is not text based`);
            interaction.editReply(`## :x: Podany kanał nie jest kanałem tekstowym.`);
            return;
        }
            
        const message = await options.channel.send(leaderboardMessage);

        interaction.editReply(`### :white_check_mark: Tablica wyników PLA Inside została utworzona: ${message.url}`);
    }

    /**
     * Get team leaderboard message
     * @warning May return null if something went wrong
     * @returns 
     */
    public async getTeamLeaderboardMessage() {
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

        // Sort teams by summary score
        const sortedTeams = Object.values(teamsData).sort((a, b) => {
            return b.summaryScore - a.summaryScore;
        });

        const embed = await this.getBasicEmbed();
        let leaderboardMessage = ``;

        let i = 1;
        for (const team of sortedTeams) {
            const prefix = i === 1 ? `# ` : i === 2 ? `## ` : i === 3 ? `### ` : ``;

            leaderboardMessage += prefix + ` #${i} ${team.emoji} **${team.team.displayName}** - ${team.summaryScore} LP\n`;
            i++;
        }

        embed.setTitle(`TOP LP Drużyn PLA Inside`);
        embed.setDescription(leaderboardMessage);

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