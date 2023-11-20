import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApexApiService } from 'src/apex-api/apex-api.service';
import { ApexAccountService } from 'src/database/entities/apex-account/apex-account.service';
import { UserService } from 'src/database/entities/user/user.service';
import { DiscordService } from '../discord.service';
import { handleStatisticsDiscordCommandDto } from '../commands/dtos/handle-statistics-discord-command.dto';
import { AttachmentBuilder, BufferResolvable, CacheType, ChatInputCommandInteraction, Client, ColorResolvable, EmbedBuilder, GuildMember, Interaction, MessagePayload, PermissionsBitField, UserContextMenuCommandInteraction } from 'discord.js';
import { ApexAccountEntity } from 'src/database/entities/apex-account/entities/apex-account.entity';
import { PlayerStatistics } from 'src/apex-api/player-statistics.interface';
import { UserEntity } from 'src/database/entities/user/user.entity';
import { EmojiService } from 'src/database/entities/emoji/emoji.service';
import { handleStatisticsApexCommandDto } from '../commands/dtos/handle-statistics-apex-command.dto';
import { platformAliases } from '../commands/dtos/handle-connect.command.dto';
import { platform } from 'os';
import { Console } from 'console';
import { ApexAccountHistoryEntity } from 'src/database/entities/apex-account-history/entities/apex-account-history.entity';
import { ApexAccountHistoryService } from 'src/database/entities/apex-account-history/apex-account-history.service';
import { ApexSeasonService } from 'src/database/entities/apex-season/apex-season.service';
import { ChannelService } from 'src/database/entities/channel/channel.service';
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

@Injectable()
export class ApexStatisticsService {

    // Canvas render service
    private canvasRenderService;

    constructor(
        private readonly apexApiService: ApexApiService,
        private readonly configService: ConfigService,
        private readonly apexAccountService: ApexAccountService,
        private readonly userService: UserService,
        private readonly discordService: DiscordService,
        private readonly emojiService: EmojiService,
        private readonly apexAccountHistoryService: ApexAccountHistoryService,
        private readonly seasonService: ApexSeasonService,
        private readonly channelService: ChannelService,
    ) {
        const Annotation = require('chartjs-plugin-annotation');
        const ChartMomentAdapter = require('chartjs-adapter-moment');
        

        // Create canvas render service
        this.canvasRenderService = new ChartJSNodeCanvas({ 
            width: 700, 
            height: 300,
            plugins: {
                modern: ['chartjs-plugin-annotation']
            },
            chartCallback: (ChartJS) => {
                ChartJS.register(Annotation);
                ChartJS.register(ChartMomentAdapter);
                ChartJS.register({
                    id: 'theme',
                    beforeDraw: (chart) => {
                        const ctx = chart.ctx;
                        ctx.fillStyle = '#202124';
                        ctx.fillRect(0, 0, chart.width, chart.height);
                    }
                });
            }
        });

    }

    /**
     * Command that handles statistics for Discord user
     * @param interaction 
     * @param options 
     */
    public async handleStatisticsDiscordCommand(interaction: ChatInputCommandInteraction<CacheType> | UserContextMenuCommandInteraction<CacheType>, options: handleStatisticsDiscordCommandDto) {
        // Check if interaction is deferred
        if (!interaction.deferred)
            await interaction.deferReply();
        
        let user = await this.userService.findByDiscordId(options.user.id);

        // If user is null, create new user
        if (!user)
            user = await this.createUser(options.user.id, options.user.permissions.has(PermissionsBitField.Flags.Administrator));

        // If user is null (something went wrong), abort
        if (!user) {
            interaction.editReply(`### :x: Nie jesteś zapisany w bazie i wystąpił błąd podczas próby naprawy tego faktu. Spróbuj ponownie później.`);
            console.trace('Couldn\'t create user');
            return null;
        }

        const apexAccount = user.apexAccount;

        if (!apexAccount) {
            interaction.editReply(`### :x: Użytkownik **${options.user.displayName}** nie ma przypisanego konta Apex Legends\nKonto może zostać połączone z kontem Apex Legends za pomocą komendy **\`/połącz\`**`);
            return;
        }

        const statistics = await this.apexApiService.getPlayerStatisticsByUID(apexAccount.uid, apexAccount.platform as 'PC' | 'PS4' | 'X1' | 'SWITCH', {});

        if (statistics?.error) {
            interaction.editReply(`### :x: Nie znaleziono statystyk dla użytkownika **${options.user.displayName}**`);
            return;
        }

        // interaction.editReply(`Statystyki użytkownika **${options.user.displayName}**`);

        let isStatisticsChannel = ((await this.channelService.findByName('statistics'))?.discordId == interaction.channelId);

        const message = await this.getStatisticsMessage(statistics, options.user, user, !isStatisticsChannel);

        interaction.editReply(message);
    }

    /**
     * Command that handles statistics for Apex Legends account
     * @param interaction Discord interaction
     * @param options Command options
     */
    public async handleStatisticsApexCommand(interaction: ChatInputCommandInteraction<CacheType>, options: handleStatisticsApexCommandDto) {
        await interaction.deferReply();

        const platformAliases = this.apexAccountService.platformAliases;

        const statistics = await this.apexApiService.getPlayerStatisticsByName(options.username, options.platform, {});

        if (statistics?.error) {
            interaction.editReply(`### :x: Nie znaleziono konta na platformie *${platformAliases[options.platform]}* dla użytkownika *${options.username}*`);
            return;
        }
        
        const apexAccount = await this.apexAccountService.findByUID(`${statistics?.global?.uid}`) ?? null;

        const user = apexAccount ? apexAccount.user : null;

        if (user)
            user.apexAccount = apexAccount;

        const discordUser = user ? await this.discordService.getMemberById(user?.discordId) : null;

        let isStatisticsChannel = ((await this.channelService.findByName('statistics'))?.discordId == interaction.channelId);

        const message = await this.getStatisticsMessage(statistics, discordUser, user, !isStatisticsChannel);

        interaction.editReply(message);
    }

    public async handleStatisticsOwnCommand(interaction: ChatInputCommandInteraction<CacheType>) {
        await interaction.deferReply();

        const discordUser = interaction.member;

        const user = await this.userService.findByDiscordId(discordUser.user.id);

        const apexAccount = user?.apexAccount;

        if (!apexAccount || !user) {
            interaction.editReply(`### :x: Nie znaleziono przypisanego konta Apex Legends! Możesz je połączyć za pomocą komendy **\`/połącz\`**`);
            return;
        }

        this.handleStatisticsDiscordCommand(interaction, {user: discordUser as GuildMember});
    }

    private async createUser(userDiscordId, isAdmin): Promise<UserEntity> {
        console.log(`Creating user ${userDiscordId} with admin: ${isAdmin}`);
        return await this.userService.create({
            discordId: userDiscordId,
            isAdmin: isAdmin,
        });
    }

    private async getStatisticsMessage(statistics: PlayerStatistics, discordUser: GuildMember, user: UserEntity, short = true) {
        console.info(`Getting statistics message for ${statistics?.global?.name}, ${discordUser?.displayName}, ${user?.discordId}`);

        const embed = this.getBasicStatisticsEmbed();
        const description = [];
        const rankToRoleNameDictionary = this.apexAccountService.rankToRoleNameDictionary;
        const rankToRoleColorDictionary = this.apexAccountService.rankToRoleColorDictionary;
        const platformToEmojiNameDictionary = this.apexAccountService.platformToEmojiNameDictionary;
        const rankToDisplayNameDictionary = this.apexAccountService.rankToDisplayNameDictionary;
        const rankDivToRomanDictionary = this.apexAccountService.rankDivToRomanDictionary;
        const platformAliases = this.apexAccountService.platformAliases;
        const apexAccount = user?.apexAccount ?? await this.apexAccountService.findByUID(`${statistics?.global?.uid}`) ?? null;

        embed.setColor(rankToRoleColorDictionary[statistics?.global?.rank?.rankName]);

        // Rank -----------------------------------------------------------------
        const rankEmoji = await this.emojiService.findByName(
            rankToRoleNameDictionary[statistics?.global?.rank.rankName]
        );
        console.info(`Rank emoji: ${rankEmoji} for ${statistics?.global?.rank.rankName}`); 
        const plaEmoji = await this.emojiService.findByName('pla');
        const serverRank = ((user?.apexAccount ?? null) != null) ? await this.apexAccountService.getServerRankByAccountId(user.apexAccount.id): null;
        const lastMidnightDate = new Date();
        // Set time to 00:03:00am
        lastMidnightDate.setHours(0, 3, 0, 0);
        const lastMidnightStats = ((user?.apexAccount ?? null) != null) ? (await this.apexAccountHistoryService.getHistoryClosestTo(apexAccount, lastMidnightDate)) : null;
        const scoreGainSinceMidnight = lastMidnightStats ? (statistics?.global?.rank.rankScore - lastMidnightStats.rankScore) : null;
        const rankDisplayName = rankToDisplayNameDictionary[statistics?.global?.rank.rankName];
        // ----------------------------------------------------------------------

        // Platform -------------------------------------------------------------
        const platform = statistics?.global?.platform;
        const platformEmoji = await this.emojiService.findByName(
            platformToEmojiNameDictionary[platform]
        );
        // ----------------------------------------------------------------------

        // Status ---------------------------------------------------------------
        if (!short) {
            const isOnline = statistics?.realtime?.isOnline;
            const isPlaying = statistics?.realtime?.isInGame;
            const partyFull = statistics?.realtime?.partyFull;
            const lobbyState = statistics?.realtime?.lobbyState == 'open' ? 'open' : 'closed';
            const currentStateSinceTimestamp = statistics?.realtime?.currentStateSinceTimestamp;
    
            const statusEmojiName = !isOnline ? 'offline' : isPlaying ? 'playing' : 'online';
            const statusEmoji = await this.emojiService.findByName(statusEmojiName);
    
            const lobbyStateEmoji = await this.emojiService.findByName(lobbyState);
    
            const statusText = [];
            if (isOnline) {
                if (currentStateSinceTimestamp != -1)
                    statusText.push(`> ` + (isPlaying ? 'Rozpoczął grę' : 'Wszedł do lobby') + ` <t:${currentStateSinceTimestamp}:R>`);
                statusText.push(`> Skład: ${partyFull ? 'Pełny :x:' : 'Niepełny :white_check_mark:'}`);
            }
            statusText.push(`> Lobby: ${(lobbyState == 'open') ? `Otwarte` : 'Zamknięte'} ${lobbyStateEmoji}`);
            statusText.push('ㅤ');

            if (isOnline) {
                embed.addFields([
                    {
                        name: `${statusEmoji} **Online**`,
                        value: statusText.join('\n'),
                    }
                ])
            } else {
                embed.addFields([
                    {
                        name: `${statusEmoji} **Offline**`,
                        value: statusText.join('\n'),
                        inline: true,
                    }
                ])
            }
        }
        // ----------------------------------------------------------------------

        // Level ----------------------------------------------------------------
        if (!short) {
            const level = statistics?.global?.level;
            const levelPrestige = statistics?.global?.levelPrestige;
            let levelEmojiName = (level <= 100) ? 'level100' : 'level500';
    
            switch (true) {
                case (levelPrestige == 1):
                    levelEmojiName = 'tier1';
                    break;
                case (levelPrestige == 2):
                    levelEmojiName = 'tier2';
                    break;
                case (levelPrestige == 3):
                    levelEmojiName = 'tier3';
                    break;
            }
            
            const levelEmoji = await this.emojiService.findByName(levelEmojiName) ?? null;

            const levelText = [];

            if (levelPrestige > 0)
                levelText.push(`> Poziom Prestiżu: **${levelPrestige}**`);

            levelText.push(`> **${statistics?.global?.toNextLevelPercent}%** do następnego poziomu`);
            levelText.push('ㅤ');

            embed.addFields([
                {
                    name: `${levelEmoji} **Poziom ${level}**`,
                    value: levelText.join('\n'),
                    inline: true,
                }
            ]);
        }
        // ----------------------------------------------------------------------

        embed.setTitle(`**${platformEmoji} ${statistics?.global?.name}**`)

        // If discord user is null then user plain data
        if (discordUser) {
            embed.setThumbnail(discordUser.displayAvatarURL())

            description.push(`Konto użytkownika <@${discordUser.id}>`);
        }
        else {
            embed.setThumbnail(statistics?.global?.avatar ?? statistics?.global?.rank.rankImg)

            if (apexAccount)
                description.push(`*Konto odłączone od użytkownika*`);
            else
                description.push(`*Konto niepowiązane na serwerze PLA*`);
        }

        const urlFriendlyName = statistics?.global?.name.replaceAll(' ', '%20');
        embed.setURL(`https://apexlegendsstatus.com/profile/${statistics?.global?.platform}/${urlFriendlyName}`);

        // Rank Content ---------------------------------------------------------
        description.push(`## ${rankEmoji} **${rankDisplayName} ${rankDivToRomanDictionary[statistics?.global?.rank.rankDiv]}**`);
        
        if (statistics?.global?.rank.ladderPosPlatform != -1)
            description.push(`:arrow_up: TOP **${statistics?.global?.rank.ladderPosPlatform}** na ${platformAliases[platform]}`);

        if(serverRank)
            description.push(`${plaEmoji} TOP **${serverRank}** na serwerze **PLA**`);
        
        description.push(`**:chart_with_upwards_trend: ${statistics?.global?.rank.rankScore}** LP`);
        
        if (scoreGainSinceMidnight != null)
            description.push(`**:calendar: ${scoreGainSinceMidnight}** LP dzisiaj`);

        description.push('ㅤ');
        // ----------------------------------------------------------------------

        // Total Stats ---------------------------------------------------------------
        if (!short) {
            const totalStats = [];

            const totalStatsNames = {
                'kills': 'Zabójstwa',
                'damage': 'Obrażenia',
                'winning_kills': 'Zwycięskie zabójstwa',
                'top_3': 'Top 3',
                'kills_as_kill_leader': 'Zabójstwa jako lider zabójstw',
                'wins': 'Zwycięstwa',
            };
    
    
            for (const statName in totalStatsNames) {
                const statValue = statistics?.total[statName] ?? null;
    
                if (statValue == null || statValue.value == -1)
                    continue;
    
                totalStats.push({
                    name: totalStatsNames[statName],
                    value: statValue.value,
                });
            }

            const totalStatsText = [];
    
            for (const stat of totalStats) {
                totalStatsText.push(`> **${stat?.name}**: \`${stat.value}\``);
            }
    
            if (totalStatsText.length == 0)
                totalStatsText.push(`> Brak statystyk`);
    
            totalStatsText.push('ㅤ');
    
            embed.addFields([
                {
                    name: `**:globe_with_meridians:  Globalne Statystyki**`,
                    value: totalStatsText.join('\n'),
                }
            ]);
        }
        // ----------------------------------------------------------------------

        // Legend ----------------------------------------------------------------
        const legend = statistics?.legends?.selected;
        if (!short) {
            const stats = legend?.data;
    
            const legendText = [];
    
            for (const stat of stats) {
                legendText.push(`> **${stat?.name}**: \`${stat.value}\``);
            }
    
            if (legendText.length == 0)
                legendText.push(`> Brak statystyk`);
    
            embed.addFields([
                {
                    name: `:radio_button:  Wybrana Legenda: **${legend?.LegendName}**`,
                    value: legendText.join('\n'),
                    inline: false,
                }
            ]);
        }

        // ----------------------------------------------------------------------

        const files = [];

        const history = (apexAccount) ? await this.apexAccountHistoryService.getPlayerHistory(apexAccount, 14) : [];

        if (history.length > 0) {
            // Save history chunk
            const historyChart: BufferResolvable = await this.getStatisticsHistoryChart(history);
    
            const attachment = new AttachmentBuilder(historyChart, {
                name: 'history-chart.png',
                description: 'Wykres historii statystyk',
            });
    
            embed.setImage('attachment://history-chart.png');

            files.push(attachment);
        } else {
            if (legend?.ImgAssets?.banner) {
                const urlFriendlyBanner = legend?.ImgAssets?.banner.replaceAll(' ', '%20');
                embed.setImage(urlFriendlyBanner);
            }
        }

        let footerText = 'Polskie Legendy Apex • Dane są aktualizowane jedynie jeśli założony jest odpowiedni tracker, mogą być więc nieaktualne';
        if (short)
            footerText += ' • Przestawiono skróconą wersję, ponieważ nie jest to kanał statystyk';


        // If some data couldn't be fetched add info to footer
        if (statistics?.global?.rank.ladderPosPlatform == -1 || !serverRank) {
            embed.setFooter({
                text: footerText,
                iconURL: this.configService.get<string>('images.logo-transparent')
            })
        }

        embed.setDescription(description.join('\n').trim());

        return { embeds: [embed], files };
    }

    /**
     * Get basic embed with logo and color
     * @returns basic embed with logo and color
     */
    private getBasicStatisticsEmbed() {
        return new EmbedBuilder()
            .setAuthor({
                name: "Statystyki Apex Legends",
                // url: "https://www.google.pl",
                iconURL: this.configService.get<string>('images.apex-icon'),
            })
            .setFooter({
                text: 'Polskie Legendy Apex • Dane są aktualizowane jedynie jeśli założony jest odpowiedni tracker, mogą być więc nieaktualne',
                iconURL: this.configService.get<string>('images.logo-transparent')
            })
            .setColor(this.configService.get<ColorResolvable>('embeds.color-primary'))
            .setTimestamp();
    }
    
    private async getStatisticsHistoryChart(statistics: ApexAccountHistoryEntity[]) {

        const avgRankScore = await this.apexAccountService.getServerAvgRankScore();

        const predatorRequirements = await this.apexApiService.getCurrentPredatorRequirements();
        const predatorLp = predatorRequirements['RP'][statistics[0]?.platform]?.val ?? null;

        const newestSeason = await this.seasonService.getNewestSeason();
        const currentSeason = this.seasonService.isCurrentSeason(newestSeason) ? newestSeason : null;
        const lastSeason = await this.seasonService.findById(newestSeason.id - 1);

        console.info(`Colors: ${currentSeason?.color}, ${lastSeason?.color}`);

        const moment = require('moment');

        const l = 14; // history length
        let dates = Array.from({ length: l }, (_, i) => {
          let d = new Date();
          d.setDate(d.getDate() - (l - 1 - i));
          return d;
        });
      
        // create empty data array of length l
        let data = Array(l).fill(null);
      
        statistics.forEach(stat => {
          let index = dates.findIndex(d => d.getDate() === stat.createdAt.getDate()); // assuming createdAt is a Date
          if (index !== -1) {
            data[index] = stat.rankScore;
          }
        });

        const filteredData = data.filter(v => v !== null);  // Filter out null values before calculating min and max

        const dataMax = Math.max(...filteredData);
        const dataMin = Math.min(...filteredData);
        const range = dataMax - dataMin;
        const padding = 0.2;  // 20% padding

        const yMax = Math.round((dataMax + range * padding) / 100) * 100;
        const yMin = Math.round((dataMin - range * padding) / 100) * 100;

        const rankLevelEntries = this.apexAccountService.rankToScoreDictionary;
        const rankLevelColors = this.apexAccountService.rankToRoleColorDictionary;

        const levelLines = [];

        console.log(`Creating lines for seasons: ${lastSeason?.name}, ${currentSeason?.name}`);

        // Create last season end date line
        if (lastSeason) {
            const lastSeasonEndDate = lastSeason.endDate;
            levelLines.push({
                type: 'line',
                xMin: lastSeasonEndDate,
                xMax: lastSeasonEndDate,
                borderColor: `#${lastSeason.color}`,
                borderWidth: 1,
                // borderDash: [5,5],
                adjustScaleRange: false,
                label: {
                    enabled: true,
                    content: lastSeason.name,
                    position: "end",
                    backgroundColor: 'rgba(32, 33, 36, 1)',
                    font: {
                        size: 14,
                        weight: 'bold',
                        color: "#F2F2F2"
                    },
                },
            });
        }
         
        // Create current season end date line
        if (currentSeason) {
            const currentSeasonEndDate = currentSeason.endDate;
            levelLines.push({
                type: 'line',
                xMin: currentSeasonEndDate,
                xMax: currentSeasonEndDate,
                borderColor: `#${currentSeason.color}`,
                borderWidth: 1,
                borderDash: [5,5],
                adjustScaleRange: false,
                label: {
                    enabled: true,
                    content: currentSeason.name,
                    position: "end",
                    backgroundColor: 'rgba(32, 33, 36, 1)',
                    font: {
                        size: 14,
                        weight: 'bold',
                        color: "#F2F2F2"
                    },
                },
            });
        }

        // Create rank level lines
        for (const [rank, level] of Object.entries(rankLevelEntries)) {
            const color = rankLevelColors[rank];
            console.log(`yMin: ${yMin}, level: ${level}, yMax: ${yMax}, ${yMin - level}, ${yMax - level}, ${yMin - level < 4000 || yMax - level < 4000}`)
            levelLines.push({
                type: 'line',
                yMin: level,
                yMax: level,
                borderColor: color,
                borderWidth: 1,
                borderDash: [5, 5],
                // Adjust scale range if line is too close to the edge
                // adjustScaleRange: (Math.abs(yMin - level)) < 2000 || (Math.abs(yMax - level)) < 2000,
                adjustScaleRange: false,
                label: {
                    backgroundColor: 'rgba(32, 33, 36, 1)',
                    content: rank,
                    display: true,
                    font: {
                        size: 14,
                        weight: 'bold',
                        color: "#F2F2F2"
                    },
                },
            });
        };

        // Create avg PLA rank line
        levelLines.push({
            type: 'line',
                yMin: avgRankScore,
                yMax: avgRankScore,
                borderColor: 'rgba(255, 255, 255, 0.5)',
                borderWidth: 1,
                borderDash: [5, 5],
                adjustScaleRange: false,
                label: {
                    backgroundColor: 'rgba(32, 33, 36, 1)',
                    content: 'Średnie LP na serwerze PLA',
                    display: true,
                    font: {
                        size: 14,
                        weight: 'bold',
                        color: "#F2F2F2"
                    },
                },
        })

        // Create predator rank line
        if (predatorLp) {
            levelLines.push({
                type: 'line',
                    yMin: predatorLp,
                    yMax: predatorLp,
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    borderWidth: 1,
                    borderDash: [5, 5],
                    adjustScaleRange: false,
                    label: {
                        backgroundColor: 'rgba(32, 33, 36, 1)',
                        content: 'Predator',
                        display: true,
                        font: {
                            size: 14,
                            weight: 'bold',
                            color: "#F2F2F2"
                        },
                    },
            })
        }
        
      
        // create canvas config
        const canvasConfig = {
            type: 'line',
            data: {
                labels: dates.map(d => moment(d).format('YYYY-MM-DD')), // Dates in MM-DD format
                datasets: [{
                    label: `Codzienna ilość LP przez ostatnie ${l} dni`,
                    data: data,
                    backgroundColor: 'rgba(153, 0, 0, 0.2)', // reddish background
                    borderColor: 'rgba(153, 0, 0, 1)', // reddish borders
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        min: yMin,
                        max: yMax,
                        ticks: {
                            color: '#F2F2F2',
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)',
                        }
                    },
                    x: {
                        type: 'time',
                        distribution: 'series',
                        time: {
                            unit: 'day',
                            displayFormats: {
                                day: 'MM/DD'
                            }
                        },
                        ticks: {
                            color: '#F2F2F2',
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)',
                        }
                    },
                },
                background: {
                      color: '#2C3E50'
                },
                legend: {
                    labels: {
                        font: {
                            size: 14,
                            weight: 'bold',
                            color: '#F2F2F2',
                        },
                    }
                },
                plugins: {
                    annotation: {
                      annotations: {
                        ...levelLines,
                      }
                    },
                    legend: {
                        labels: {
                            color: '#F2F2F2' // Set the color to white
                        }
                    }
                  }
            },
        };
      
        const image = await this.canvasRenderService.renderToBuffer(canvasConfig);
      
        return image;
    }
      
      
}
