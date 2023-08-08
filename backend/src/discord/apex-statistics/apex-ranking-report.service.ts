import { Inject, Injectable, forwardRef } from "@nestjs/common";
import { CronService } from "src/cron/cron.service";
import { ApexAccountHistoryService } from "src/database/entities/apex-account-history/apex-account-history.service";
import { ChannelService } from "src/database/entities/channel/channel.service";
import { MessageService } from "src/database/entities/message/message.service";
import { DiscordService } from "../discord.service";
import { EmojiService } from "src/database/entities/emoji/emoji.service";
import { ApexAccountService } from "src/database/entities/apex-account/apex-account.service";
import { ConfigService } from "@nestjs/config";
import { CacheType, ChannelType, ChatInputCommandInteraction } from "discord.js";
import { AdminCreateRankingReportDto } from "../commands/dtos/admin-create-ranking-report.dto";
import { ApexAccountEntity } from "src/database/entities/apex-account/entities/apex-account.entity";
import { ApexAccountHistoryEntity } from "src/database/entities/apex-account-history/entities/apex-account-history.entity";
import { ApexSeasonService } from "src/database/entities/apex-season/apex-season.service";
import { ApexSeasonEntity } from "src/database/entities/apex-season/entities/apex-season.entity";
import { platform } from "os";
import { ApexApiService } from "src/apex-api/apex-api.service";

@Injectable()
export class ApexRankingReportService {
    constructor(
        private readonly apexAccountService: ApexAccountService,
        private readonly emojiService: EmojiService,
        private readonly discordService: DiscordService,
        private readonly apexAccountHistoryService: ApexAccountHistoryService,
        private readonly apexSeasonService: ApexSeasonService,
        private readonly apexApiService: ApexApiService,
    ) {}

    public async handleAdminCreateRankingReport(interaction: ChatInputCommandInteraction<CacheType>, options: AdminCreateRankingReportDto) {

        if (!options.channel)
            options.channel = interaction.channel;

        console.log(`[ApexLeaderboardService] handleAdminCreateLeaderboard: ${options.channel}`);

        await interaction.reply({ content: 'Generowanie raportu...', ephemeral: true });

        if (options.channel.type in [ChannelType.GuildText, ChannelType.GuildAnnouncement]) {
            interaction.editReply({ content: '### :x: Tablica może być tworzona tylko na kanale tekstowym!'});
            return false;
        }

        let season: ApexSeasonEntity;

        if (options.season) {
            const dbSeason = await this.apexSeasonService.findById(options.season);

            if (!dbSeason) {
                interaction.editReply({ content: '### :x: Podany sezon nie istnieje!'});
                return false;
            }

            season = dbSeason;
        } else {
            const currentDbSeason = await this.apexSeasonService.getNewestSeason();

            if (!currentDbSeason) {
                interaction.editReply({ content: '### :x: Błąd wewnętrzny: Nie znaleziono aktualnego sezonu!'});
                throw new Error('No current season found!');
                return false;
            }

            season = currentDbSeason;
        }

        console.log(`[ApexLeaderboardService] handleAdminCreateLeaderboard:`, season);  

        interaction.editReply({ content: `### :timer: Generowanie raportu dla sezonu *${season.name}*!`});

        const raportMessages = await this.generateRankingReport(season);

        if (!raportMessages || raportMessages.length === 0) {
            interaction.editReply({ content: '### :x: Nie znaleziono kont przed końcem sezonu!'});
            return false;
        }

        raportMessages.forEach(async (message) => {
            if (options.channel.type == ChannelType.GuildText || options.channel.type == ChannelType.GuildAnnouncement)
                options.channel.send(message);
        });

        interaction.editReply({ content: `### :white_check_mark: Raport został wygenerowany!`});
    }

    private async generateRankingReport(season: ApexSeasonEntity) {

        let accounts;
        const seasonStartTimestamp = Math.floor(new Date(season.startDate).getTime() / 1000);
        const seasonEndTimestamp = Math.floor(new Date(season.endDate).getTime() / 1000);

        console.info(`[ApexRankingReportService] generateRankingReport: ${season.name}`);

        const isCurrentSeason = await this.apexSeasonService.isCurrentSeason(season);

        let predatorData = null;

        if (isCurrentSeason) {
            console.log(`[ApexRankingReportService] generateRankingReport: ${season.name} is current season`)
            accounts = await this.apexAccountService.getServerRankTopX(null);
            predatorData = await this.apexApiService.getCurrentPredatorRequirements();

            if (predatorData.error) {
                console.error(`[ApexRankingReportService] generateRankingReport: ${season.name} - ${predatorData.error}`);
                predatorData = null;
            }
        } else {
            console.log(`[ApexRankingReportService] generateRankingReport: ${season.name} is not current season`)
            accounts = await this.apexAccountHistoryService.getTopXAtTime(null, new Date(season.endDate), false);
        }

        console.log(`[ApexRankingReportService] generateRankingReport: ${accounts.length} accounts found`);
        
        // If there are no accounts
        if (!accounts || accounts.length === 0) {
            return [];
        }

        const rankToRoleNameDictionary = this.apexAccountService.rankToRoleNameDictionary;
        const rankToRoleColorDictionary = this.apexAccountService.rankToRoleColorDictionary;
        const rankDivToRomanDictionary = this.apexAccountService.rankDivToRomanDictionary;
        const rankToScoreDictionary = this.apexAccountService.rankToScoreDictionary;
        const platformToEmojiNameDictionary = this.apexAccountService.platformToEmojiNameDictionary;

        const plaEmoji = await this.emojiService.findByName('pla');

        const firstEmoji = await this.emojiService.findByName('first');
        const secondEmoji = await this.emojiService.findByName('second');
        const thirdEmoji = await this.emojiService.findByName('third');

        let content = ``;
        const rankGroups = new Object();
        

        let i = 1;
        accounts.map((account) => {
            rankGroups[account.rankName] = rankGroups[account.rankName] || {};
            rankGroups[account.rankName][`${i}`] = account;
            i++;
        });


        console.log(plaEmoji.toString, plaEmoji.toString());

        content += `## ${plaEmoji} TOP ${accounts.length} połączonych kont PLA`;

        content += `\n# Sezon ${season.id} - ${season.name}`

        content += `\n### <t:${seasonStartTimestamp}:d> - <t:${seasonEndTimestamp}:d>\n\n`

        for (const rankGroupName in rankGroups) {
            const rankGroup = rankGroups[rankGroupName];
            const rankRoleName = rankToRoleNameDictionary[rankGroupName];
            const rankRoleColor = rankToRoleColorDictionary[rankGroupName];
            const rankScore = rankToScoreDictionary[rankGroupName];

            const rankEmojiName = rankToRoleNameDictionary[rankGroupName];
            const rankEmoji = await this.emojiService.findByName(rankEmojiName);

            const platformEmojis = [];

            if (rankGroup.length === 0) {
                console.info(`[ApexRankingReportService] generateRankingReport: ${rankGroupName} - ${rankScore} LP - Rank group is empty!`);
                continue;
            }

            content += `\n\n\n` + `:heavy_minus_sign:`.repeat(14) + `ㅤ`;

            if (rankGroupName == `Apex Predator`) {
                content += `\n## ${rankEmoji} ${rankGroupName} (${Object.keys(rankGroup).length} graczy)`;
            } else {
                content += `\n## ${rankEmoji} ${rankGroupName} - ${rankScore} LP (${Object.keys(rankGroup).length} graczy)`;
            }


            content += `\n` + `:heavy_minus_sign:`.repeat(14) + `ㅤ`;

            for (const accountKey in rankGroup) {
                const account: ApexAccountEntity | ApexAccountHistoryEntity = rankGroup[accountKey];

                console.log(`[ApexRankingReportService] generateRankingReport: ${accountKey} - ${account.name}`)

                // Optimize emoji fetching
                const platformEmojiName = platformToEmojiNameDictionary[account.platform];
                const platformEmoji = platformEmojis[platformEmojiName] || await this.emojiService.findByName(platformEmojiName);
                platformEmojis[platformEmojiName] = platformEmoji;

                const rankDiv = rankDivToRomanDictionary[account.rankDivision];
                const rankName = rankGroupName;
                const rankRole = rankRoleName;

                let discordUser;
                if (account instanceof ApexAccountHistoryEntity) {
                    discordUser = await this.discordService.getUserById(account.apexAccount.user.discordId)
                } else if (account instanceof ApexAccountEntity) {
                    discordUser = await this.discordService.getUserById(account.user.discordId)
                }

                if (!discordUser) {
                    console.error(`[ApexRankingReportService] generateRankingReport: ${accountKey} - ${account.name} - Discord user not found!`);
                    continue;
                }

                let accountKeySymbol = `#` + accountKey;

                switch (accountKey) {
                    case '1':
                        accountKeySymbol = firstEmoji.toString();
                        break;
                    case '2':
                        accountKeySymbol = secondEmoji.toString();
                        break;
                    case '3':
                        accountKeySymbol = thirdEmoji.toString();
                        break;
                }
            

                if (rankGroupName == `Apex Predator`) {
                    let predatorRequirement = ``;

                    console.log(predatorData);

                    if (predatorData) {
                        predatorRequirement += ` / `;
                        predatorRequirement += predatorData['RP'][account.platform]?.val ?? null;
                    }

                    content += `\n**${accountKeySymbol}** ${rankEmoji} ${platformEmoji} **${account.name}** | ${rankName} | **${account.rankScore}${predatorRequirement}** LP [${discordUser}]\n`;
                } else {
                    content += `\n**${accountKeySymbol}** ${rankEmoji} ${platformEmoji} **${account.name}** | ${rankName} ${rankDiv} | **${account.rankScore}** LP [${discordUser}]\n`;
                }
                
            }
        }

        content += `\n` + `:heavy_minus_sign:`.repeat(14) + `ㅤ`

        content += `\n### ${plaEmoji} Gratulujemy wszystkim graczom zdobytych rang!`;

        const messages = [];

        console.log(content);

        while (content.length > 0) {
            let index = content.lastIndexOf('\n', 2000);
            if (index === -1 || index > 2000) {
                index = 2000;
            }
            messages.push(content.substring(0, index));
            content = content.substring(index + 1);
        }

        return messages;
    }

    
}