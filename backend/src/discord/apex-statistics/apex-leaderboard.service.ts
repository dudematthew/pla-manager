import { Injectable } from "@nestjs/common";
import { CacheType, ChannelType, ChatInputCommandInteraction, EmbedBuilder, GuildMember } from "discord.js";
import { AdminCreateLeaderboardDto } from "../commands/dtos/admin-create-leaderboard.dto";
import { ConfigService } from "@nestjs/config";
import { HtmlApiService } from "src/html-api/html-api.service";
import { TopPlayerTemplateParams } from "src/html-api/templates/top-player";
import { ApexAccountService } from "src/database/entities/apex-account/apex-account.service";
import { EmojiService } from "src/database/entities/emoji/emoji.service";
import { DiscordService } from "../discord.service";
import { start } from "repl";
import { ApexAccountHistoryService } from "src/database/entities/apex-account-history/apex-account-history.service";

@Injectable()
export class ApexLeaderboardService {

    constructor(
        private readonly configService: ConfigService,
        private readonly htmlApiService: HtmlApiService,
        private readonly apexAccountService: ApexAccountService,
        private readonly emojiService: EmojiService,
        private readonly discordService: DiscordService,
        private readonly apexAccountHistoryService: ApexAccountHistoryService,
    ) {}

    public async handleAdminCreateLeaderboard(interaction: ChatInputCommandInteraction<CacheType>, options: AdminCreateLeaderboardDto) {

        if (!options.channel)
            options.channel = interaction.channel;

        console.log(`[ApexLeaderboardService] handleAdminCreateLeaderboard: ${options.channel}`);

        interaction.reply({ content: 'Tworzenie tablicy...', ephemeral: true });

        if (options.channel.type !== ChannelType.GuildText) {
            interaction.editReply({ content: '### :x: Tablica może być tworzona tylko na kanale tekstowym!'});
            return false;
        }

        // --- Create embed ---

        const currentTimestamp = Math.floor(Date.now() / 1000);

        const rankToEmojiNameDictionary = this.apexAccountService.rankToRoleNameDictionary;
        const rankDivToRomanDictionary = this.apexAccountService.rankDivToRomanDictionary;
        const platformToEmojiNameDictionary = this.apexAccountService.platformToEmojiNameDictionary;
        const discordEmoji = await this.emojiService.findByName('discord');
        const arrowUpEmoji = await this.emojiService.findByName('arrowup');
        const arrowDownEmoji = await this.emojiService.findByName('arrowdown');
        const firstEmoji = await this.emojiService.findByName('first');
        const secondEmoji = await this.emojiService.findByName('second');
        const thirdEmoji = await this.emojiService.findByName('third');


        const embed = await this.getBasicLeaderboardEmbed();
        const bottomEmbed = new EmbedBuilder();

        const topPlayers = await this.apexAccountService.getServerRankTopX(20);
        const totalAccounts = await this.apexAccountService.countAll();

        const lastTopPlayerLp = topPlayers[topPlayers.length - 1].rankScore;

        // Get date of monday at 00:01 AM
        const lastMonday = new Date();
        lastMonday.setDate(lastMonday.getDate() - (lastMonday.getDay() + 6) % 7);

        const differenceDate = lastMonday;

        const description = [];


        description.push(`## ${totalAccounts} połączonych kont na serwerze`);
        description.push(`### **${lastTopPlayerLp} LP** aby znaleźć się na liście`);
        description.push(`Zaktualizowano tablicę <t:${currentTimestamp}:T>`);
        description.push(`Następna aktualizacja <t:${currentTimestamp + 60 * 60 * 24}:R>`);
        description.push(`Zmiany pozycji liczone są od <t:${Math.floor(differenceDate.getTime() / 1000)}:f>`);
        description.push(`ㅤ`);
        description.push(`:heavy_minus_sign::heavy_minus_sign::heavy_minus_sign::heavy_minus_sign::heavy_minus_sign::heavy_minus_sign::heavy_minus_sign:`);

        const topAccount = topPlayers[0];
        const topDiscordMember = await this.discordService.getMemberById(topAccount.user.discordId);

        const topPlayerHistory = await this.apexAccountHistoryService.getTopXAtTime(20, differenceDate);

        console.log('LOGO: ', this.configService.get<string>('images.logo'));

        const topImageUrl = await this.htmlApiService.getImageFromHtml({
            logoUrl: this.configService.get<string>('images.logo-transparent-small'),
            avatarImgUrl: topDiscordMember.displayAvatarURL(),
            playerName: topDiscordMember.displayName,
            playerNickname: topDiscordMember.user.username,
        } as TopPlayerTemplateParams, 'topPlayer');

        console.info('TOP IMAGE URL: ', topImageUrl);

        embed.setThumbnail(topImageUrl);

        // Optimize data fetching
        const rankEmojis = [];        

        for (let index = 0; index < topPlayers.length; index++) {
            const player = topPlayers[index];
            const position = index + 1;
            let name = '';
            let value = '';
            const rankEmojiName = rankToEmojiNameDictionary[player.rankName];
            const rankEmoji = rankEmojis[rankEmojiName] ?? await this.emojiService.findByName(rankEmojiName);
            const userInfo = `${player.name}`;

            const platform = player.platform;
            const platformEmoji = await this.emojiService.findByName(
                platformToEmojiNameDictionary[platform]
            );
            
            // Calculate the drop/ascend value
            let dropAscend = '';
            if (topPlayerHistory.length > 0) {
              const playerHistory = topPlayerHistory.find(history => history.apexAccount.id === player.id);
              if (playerHistory) {
                const playerIndex = topPlayerHistory.findIndex(history => history.apexAccount.id === player.id) + 1;
                const rankChange = playerIndex - position;

                // generate random number from -2 to 2
                // const rankChange = Math.floor(Math.random() * 5) - 2;

                console.log(`Player found in history: ${playerHistory.apexAccount?.name} - ${playerIndex} - ${position} - ${rankChange}`);
                if (rankChange < 0) {
                  dropAscend = `${Math.abs(rankChange)} <:${arrowDownEmoji.name}:${arrowDownEmoji.discordId}>`;
                } else if (rankChange > 0) {
                  dropAscend = `${rankChange} <:${arrowUpEmoji.name}:${arrowUpEmoji.discordId}>`;
                }
              }
            }

            if (dropAscend !== '')
                dropAscend = ` (${dropAscend})`;

            let titleHashTagAmount = '';
            let subTitleHashTagAmount = '';
        
            switch (index) {
              case 0:
                name += `<:${firstEmoji.name}:${firstEmoji.discordId}> `;
                titleHashTagAmount = "## ";
                subTitleHashTagAmount = "### ";
                break;
              case 1:
                name += `<:${secondEmoji.name}:${secondEmoji.discordId}> `;
                titleHashTagAmount = "### ";
                subTitleHashTagAmount = "";
                break;
              case 2:
                name += `<:${thirdEmoji.name}:${thirdEmoji.discordId}> `;
                break;
              default:
                name += `#${position} `;
            }

            name += `<:${platformEmoji.name}:${platformEmoji.discordId}> `;
        
            name += `${userInfo}`;
        
            value += `<:${rankEmoji.name}:${rankEmoji.discordId}> **${player.rankName} ${rankDivToRomanDictionary[player.rankDivision]}** - ${player.rankScore} LP`;
            value += `\n`;
            value += `<:${discordEmoji.name}:${discordEmoji.discordId}> <@${player.user.discordId}>${dropAscend}`;

            // Add a divider if it's not the last player
            if (index < topPlayers.length - 1 && index != 10) {
                value += `\nㅤ\n`;
                value += `:heavy_minus_sign::heavy_minus_sign::heavy_minus_sign::heavy_minus_sign::heavy_minus_sign::heavy_minus_sign::heavy_minus_sign:`;
            } 

            if (index <= 1) {
                description.push(`${titleHashTagAmount}${name}`);
                description.push(`${subTitleHashTagAmount}${value}`);
                continue;
            }

            if (index > 10) {
                bottomEmbed.addFields({
                    name,
                    value: value + '\nㅤ',
                    inline: false,
                });
                continue;
            }

            embed.addFields({
              name,
              value: value + '\nㅤ',
              inline: false,
            });
        }

        embed.setDescription(description.join('\n'));

        embed.setFooter({
            text: 'ㅤ'.repeat(42),
        })

        bottomEmbed.setFooter({
            text: `Polskie Legendy Apex • Pozycja na liście jest wyznaczana na podstawie ilości LP gracza • Aby znaleźć się na tablicy wyników należy połączyć konto za pomocą komendy /połącz`,
            iconURL: this.configService.get<string>('images.logo'),
        });

        const message = await options.channel.send({ embeds: [embed, bottomEmbed] });
    }

    private async getBasicLeaderboardEmbed (): Promise<EmbedBuilder> {
        const embed = new EmbedBuilder();

        embed.setAuthor({
            name: 'TOP 20 graczy PLA',
            iconURL: this.configService.get<string>('images.logo'),
        })


        return embed;
    }
}