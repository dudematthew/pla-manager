import { Inject, Injectable, forwardRef } from "@nestjs/common";
import { CacheType, ChannelType, ChatInputCommandInteraction, EmbedBuilder, GuildMember, Message } from "discord.js";
import { AdminCreateLeaderboardDto } from "../commands/dtos/admin-create-leaderboard.dto";
import { ConfigService } from "@nestjs/config";
import { HtmlApiService } from "src/html-api/html-api.service";
import { TopPlayerTemplateParams } from "src/html-api/templates/top-player";
import { ApexAccountService } from "src/database/entities/apex-account/apex-account.service";
import { EmojiService } from "src/database/entities/emoji/emoji.service";
import { DiscordService } from "../discord.service";
import { start } from "repl";
import { ApexAccountHistoryService } from "src/database/entities/apex-account-history/apex-account-history.service";
import { MessageService } from "src/database/entities/message/message.service";
import { ChannelService } from "src/database/entities/channel/channel.service";
import { MessageEntity } from "src/database/entities/message/entities/message.entity";
import { CronService } from "src/cron/cron.service";
import { SynchronizationStatusOptions } from "../apex-connect/apex-sync.service";

@Injectable()
export class ApexLeaderboardService {

    constructor(
        private readonly configService: ConfigService,
        private readonly htmlApiService: HtmlApiService,
        private readonly apexAccountService: ApexAccountService,
        private readonly emojiService: EmojiService,
        private readonly discordService: DiscordService,
        private readonly apexAccountHistoryService: ApexAccountHistoryService,
        private readonly messageService: MessageService,
        private readonly channelService: ChannelService,
        @Inject(forwardRef(() => CronService))
        private readonly cronService: CronService,
    ) {}

    public async handleAdminCreateLeaderboard(interaction: ChatInputCommandInteraction<CacheType>, options: AdminCreateLeaderboardDto) {

        if (!options.channel)
            options.channel = interaction.channel;

        console.log(`[ApexLeaderboardService] handleAdminCreateLeaderboard: ${options.channel}`);

        await interaction.reply({ content: 'Tworzenie tablicy...', ephemeral: true });

        if (options.channel.type !== ChannelType.GuildText) {
            interaction.editReply({ content: '### :x: Tablica może być tworzona tylko na kanale tekstowym!'});
            return false;
        }

        const message = await this.getLeaderboardMessage();
        let sentMessage: Message;

        try {
            sentMessage = await options.channel.send(message);
        } catch (e) {
            console.error(e);
            interaction.editReply({ content: '### :x: Nie udało się utworzyć tablicy!'});
            return false;
        }

        const leaderboardChannel = await this.channelService.findByName('leaderboard');

        if (!leaderboardChannel) {
            interaction.editReply({ content: '### :x: Nie udało się utworzyć tablicy - nie znaleziono kanału TOP20!'});
            sentMessage.delete();
            return false;
        }

        if (leaderboardChannel.discordId == options.channel.id) {
            // Check if message already exists
            const dbMessageExists = await this.messageService.findByName('leaderboard');
    
            let dbMessage: MessageEntity = null;
    
            if (dbMessageExists) {
                dbMessage = await this.messageService.update(dbMessageExists.id, {
                    discordId: `${sentMessage.id}`,
                    name: 'leaderboard',
                    channelId: leaderboardChannel.id,
                });
            } else {
                dbMessage = await this.messageService.create({
                    discordId: `${sentMessage.id}`,
                    name: 'leaderboard',
                    channelId: leaderboardChannel.id,
                })
            }
    
            if (!dbMessage) {
                interaction.editReply({ content: '### :x: Nie udało się utworzyć tablicy - błąd bazy danych!'});
                sentMessage.delete();
                return false;
            }
            interaction.editReply({ content: '### :white_check_mark: Tablica została utworzona!'});

            return;
        }
            
        interaction.editReply({ content: `### :x: Uwaga! kanał <#${options.channel.id}> nie jest kanałem TOP20!\nZostanie wysłana testowa wiadomość która nie będzie aktualizowana!`});
    }

    public async handleAdminUpdateLeaderboard(interaction: ChatInputCommandInteraction<CacheType>) {
        await interaction.reply({ content: 'Aktualizowanie tablicy...', ephemeral: true });

        const success = await this.updateLeaderboard();

        if (success) {
            interaction.editReply({ content: '### :white_check_mark: Tablica została zaktualizowana!'});
        } else {
            interaction.editReply({ content: '### :x: Nie udało się zaktualizować tablicy!\nSprawdź czy tablica została utworzona i czy kanał TOP20 jest poprawnie ustawiony!'});
        }
    }

    /**
     * Updates the leaderboard message
     */
    public async updateLeaderboard() {
        const dbLeaderboardMessage = await this.messageService.findByName('leaderboard');

        if (!dbLeaderboardMessage) {
            console.error(`[ApexLeaderboardService] handleAdminUpdateLeaderboard: Leaderboard message not found`);
            return false;
        }

        const leaderboardChannel = dbLeaderboardMessage.channel;

        if (!leaderboardChannel) {
            console.error(`[ApexLeaderboardService] handleAdminUpdateLeaderboard: Leaderboard channel not found`);
            return false;
        }

        const discordMessage = await this.discordService.getMessage(leaderboardChannel.discordId, dbLeaderboardMessage.discordId);

        if (!discordMessage) {
            console.error(`[ApexLeaderboardService] handleAdminUpdateLeaderboard: Leaderboard message not found on Discord`);
            return false;
        }

        const message = await this.getLeaderboardMessage();

        try {
            await discordMessage.edit(message);
        } catch (error) {
            console.error(`[ApexLeaderboardService] handleAdminUpdateLeaderboard: Error while updating leaderboard message`);
            console.error(error);
            return false;
        }
        
        console.log(`[ApexLeaderboardService] handleAdminUpdateLeaderboard: Leaderboard message updated`);
        return true;
    }

    private async getLeaderboardMessage () {
        // --- Create embed ---

        const currentTimestamp = Math.floor(Date.now() / 1000);

        const rankToEmojiNameDictionary = this.apexAccountService.rankToRoleNameDictionary;
        const rankDivToRomanDictionary = this.apexAccountService.rankDivToRomanDictionary;
        const platformToEmojiNameDictionary = this.apexAccountService.platformToEmojiNameDictionary;
        const rankToDisplayNameDictionary = this.apexAccountService.rankToDisplayNameDictionary;
        const discordEmoji = await this.emojiService.findByName('discord');
        const arrowUpEmoji = await this.emojiService.findByName('arrowup');
        const arrowDownEmoji = await this.emojiService.findByName('arrowdown');
        const firstEmoji = await this.emojiService.findByName('first');
        const secondEmoji = await this.emojiService.findByName('second');
        const thirdEmoji = await this.emojiService.findByName('third');


        const embed = await this.getBasicLeaderboardEmbed();
        const middleEmbed = new EmbedBuilder();
        const bottomEmbed = new EmbedBuilder();
        
        let embedCounter = 0;
        let bottomEmbedCounter = 0;

        function updateCounter(length: number) {
            embedCounter += length;
        }
            
        function updateBottomCounter(length: number) {
            bottomEmbedCounter += length;
        }
        updateCounter(17);

        const topPlayers = await this.apexAccountService.getServerRankTopX(20);
        const totalAccounts = await this.apexAccountService.countAll();

        const lastTopPlayerLp = topPlayers[topPlayers.length - 1].rankScore;

        // Get date of monday at 00:01 AM
        const lastMonday = new Date();
        lastMonday.setDate(lastMonday.getDate() - (lastMonday.getDay() + 6) % 7);

        const differenceDate = lastMonday;

        const cronJob = this.cronService.getCronJob('updateLeaderboard');
       
        let nextSynchronization = cronJob.nextDate() ?? null;

        const nextSynchronizationTimestamp = !!nextSynchronization ? nextSynchronization.toUnixInteger() : null;

        const description = [];


        description.push(`## ${totalAccounts} połączonych kont na serwerze`);
        description.push(`### **${lastTopPlayerLp} LP** aby znaleźć się na liście`);
        description.push(`Zaktualizowano tablicę <t:${currentTimestamp}:T>`);
        description.push(`Następna aktualizacja <t:${nextSynchronizationTimestamp}:R>`);
        description.push(`Zmiany pozycji liczone są od <t:${Math.floor(differenceDate.getTime() / 1000)}:f>`);
        description.push(`ㅤ`);
        description.push(`:heavy_minus_sign:`.repeat(7));

        const topAccount = topPlayers[0];
        const topDiscordMember = await this.discordService.getMemberById(topAccount.user.discordId);

        const topPlayerHistory = await this.apexAccountHistoryService.getTopXAtTime(20, differenceDate);

        console.log('LOGO: ', this.configService.get<string>('images.logo'));

        let topImageUrl = await this.htmlApiService.getImageFromHtml({
            logoUrl: this.configService.get<string>('images.logo-transparent-small'),
            avatarImgUrl: topDiscordMember.displayAvatarURL(),
            playerName: topDiscordMember.displayName,
            playerNickname: '@' + topDiscordMember.user.username,
        } as TopPlayerTemplateParams, 'topPlayer');

        console.info('TOP IMAGE URL: ', topImageUrl);

        if (!topImageUrl) {
            topImageUrl = topDiscordMember.displayAvatarURL();
        }

        embed.setThumbnail(topImageUrl);

        // Optimize data fetching
        const rankEmojis = [];        

        for (let index = 0; index < topPlayers.length; index++) {
            const player = topPlayers[index];
            const position = index + 1;
            let name = '';
            let value = '';
            
            const rankDisplayName = rankToDisplayNameDictionary[player.rankName];
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
        
            value += `${rankEmoji} **${rankDisplayName} ${rankDivToRomanDictionary[player.rankDivision]}** - ${player.rankScore} LP`;
            value += `\n`;
            if (player?.user?.discordId)
                value += `${discordEmoji} <@${player.user.discordId}>${dropAscend}`;
            else
                value += `${discordEmoji} *Niepowiązane*${dropAscend}`;

            // Add a divider if it's not the last player
            if (index < topPlayers.length - 1 && index != 6 && index != 12) {
                value += `\nㅤ\n`;
                value += `:heavy_minus_sign:`.repeat(7);
            } 

            if (index <= 1) {
                description.push(`${titleHashTagAmount}${name}`);
                description.push(`${subTitleHashTagAmount}${value}`);
                continue;
            }

            if (index > 6 && index < 13) {
                middleEmbed.addFields({
                    name,
                    value: value + '\nㅤ',
                    inline: false,
                });
                updateBottomCounter(name.length + value.length + 1);
                console.log(`Field length for name: ${name.length} | value: ${value.length}`);
                continue;
            } else if (index >= 13 && index < 20) {
                bottomEmbed.addFields({
                    name,
                    value: value + '\nㅤ',
                    inline: false,
                });
                updateBottomCounter(name.length + value.length + 1);
                console.log(`Field length for name: ${name.length} | value: ${value.length}`);
                continue;
            }

            embed.addFields({
              name,
              value: value + '\nㅤ',
              inline: false,
            });
            console.log(`Field length for name: ${name.length} | value: ${value.length}`);
            updateCounter(name.length + value.length + 1);
        }

        embed.setDescription(description.join('\n'));
        updateCounter(description.length);
        console.log(`Description length: ${description.length}`);

        embed.setFooter({
            text: 'ㅤ'.repeat(42),
        })
        middleEmbed.setFooter({
            text: 'ㅤ'.repeat(42),
        });
        updateCounter(42);
        console.log(`Footer length: 42`);

        bottomEmbed.setFooter({
            text: `Polskie Legendy Apex • Pozycja na liście jest wyznaczana na podstawie ilości LP gracza • Aby znaleźć się na tablicy wyników należy połączyć konto za pomocą komendy /połącz`,
            iconURL: this.configService.get<string>('images.logo'),
        });
        updateBottomCounter(171);
        console.log(`Bottom footer length: 171`);

        console.info(`Embed counter: ${embedCounter} | Bottom embed counter: ${bottomEmbedCounter}`);


        return { embeds: [embed, middleEmbed, bottomEmbed] };
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