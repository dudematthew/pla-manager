import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApexApiService } from 'src/apex-api/apex-api.service';
import { ApexAccountService } from 'src/database/entities/apex-account/apex-account.service';
import { UserService } from 'src/database/entities/user/user.service';
import { DiscordService } from '../discord.service';
import { handleStatisticsDiscordCommandDto } from '../commands/dtos/handle-statistics-discord-command.dto';
import { CacheType, ChatInputCommandInteraction, ColorResolvable, EmbedBuilder, GuildMember } from 'discord.js';
import { ApexAccountEntity } from 'src/database/entities/apex-account/entities/apex-account.entity';
import { PlayerStatistics } from 'src/apex-api/player-statistics.interface';
import { UserEntity } from 'src/database/entities/user/user.entity';
import { EmojiService } from 'src/database/entities/emoji/emoji.service';
import { handleStatisticsApexCommandDto } from '../commands/dtos/handle-statistics-apex-command.dto';
import { platformAliases } from '../commands/dtos/handle-connect.command.dto';
import { platform } from 'os';
import { Console } from 'console';

@Injectable()
export class ApexStatisticsService {

    constructor(
        private readonly apexApiService: ApexApiService,
        private readonly configService: ConfigService,
        private readonly apexAccountService: ApexAccountService,
        private readonly userService: UserService,
        private readonly discordService: DiscordService,
        private readonly emojiService: EmojiService,
    ) {}

    /**
     * Command that handles statistics for Discord user
     * @param Interaction 
     * @param options 
     */
    public async handleStatisticsDiscordCommand(Interaction: ChatInputCommandInteraction<CacheType>, options: handleStatisticsDiscordCommandDto) {
        // Check if interaction is deferred
        if (!Interaction.deferred)
            Interaction.deferReply();
        
        const user = await this.userService.findByDiscordId(options.user.id);

        // todo: if user not found, create new user

        if (!user) {
            Interaction.editReply(`### :x: Nie znaleziono użytkownika **${options.user.displayName}**`);
            return;
        }

        const apexAccount = user.apexAccount;

        if (!apexAccount) {
            Interaction.editReply(`### :x: Użytkownik **${options.user.displayName}** nie ma przypisanego konta Apex Legends\nKonto może zostać połączone z kontem Apex Legends za pomocą komendy **\`/połącz\`**`);
            return;
        }

        const statistics = await this.apexApiService.getPlayerStatisticsByUID(apexAccount.uid, apexAccount.platform as 'PC' | 'PS4' | 'X1' | 'SWITCH', {});

        if (statistics?.error) {
            Interaction.editReply(`### :x: Nie znaleziono statystyk dla użytkownika **${options.user.displayName}**`);
            return;
        }

        // Interaction.editReply(`Statystyki użytkownika **${options.user.displayName}**`);

        const embed = await this.getStatisticsEmbed(statistics, options.user, user);

        Interaction.editReply({ embeds: [embed] });
    }

    /**
     * Command that handles statistics for Apex Legends account
     * @param Interaction Discord interaction
     * @param options Command options
     */
    public async handleStatisticsApexCommand(Interaction: ChatInputCommandInteraction<CacheType>, options: handleStatisticsApexCommandDto) {
        Interaction.deferReply();

        const platformAliases = this.apexAccountService.platformAliases;

        const statistics = await this.apexApiService.getPlayerStatisticsByName(options.username, options.platform, {});

        if (statistics?.error) {
            Interaction.editReply(`### :x: Nie znaleziono konta na platformie *${platformAliases[options.platform]}* dla użytkownika *${options.username}*`);
            return;
        }
        
        const apexAccount = await this.apexAccountService.findByUID(`${statistics?.global?.uid}`) ?? null;

        const user = apexAccount ? apexAccount.user : null;

        if (user)
            user.apexAccount = apexAccount;

        const discordUser = user ? await this.discordService.getMemberById(user.discordId) : null;

        const embed = await this.getStatisticsEmbed(statistics, discordUser, user);

        Interaction.editReply({ embeds: [embed] });
    }

    public async handleStatisticsOwnCommand(Interaction: ChatInputCommandInteraction<CacheType>) {
        Interaction.deferReply();

        const discordUser = Interaction.member;

        const user = await this.userService.findByDiscordId(discordUser.user.id);

        const apexAccount = user?.apexAccount;

        if (!apexAccount || !user) {
            Interaction.editReply(`### :x: Nie znaleziono przypisanego konta Apex Legends! Możesz je połączyć za pomocą komendy **\`/połącz\`**`);
            return;
        }

        this.handleStatisticsDiscordCommand(Interaction, {user: discordUser as GuildMember});
    }

    private async getStatisticsEmbed(statistics: PlayerStatistics, discordUser: GuildMember, user: UserEntity): Promise<EmbedBuilder> {
        console.group('getStatisticsEmbed');
        const embed = this.getBasicStatisticsEmbed();
        const description = [];
        const rankToRoleNameDictionary = this.apexAccountService.rankToRoleNameDictionary;
        const rankToRoleColorDictionary = this.apexAccountService.rankToRoleColorDictionary;
        const platformToEmojiNameDictionary = this.apexAccountService.platformToEmojiNameDictionary;
        const rankDivToRomanDictionary = this.apexAccountService.rankDivToRomanDictionary;
        const platformAliases = this.apexAccountService.platformAliases;

        embed.setColor(rankToRoleColorDictionary[statistics?.global?.rank?.rankName]);

        console.info('MILESTONE 1');

        // Rank -----------------------------------------------------------------
        const rankEmoji = await this.emojiService.findByName(
            rankToRoleNameDictionary[statistics?.global?.rank.rankName]
        );
        const plaEmoji = await this.emojiService.findByName('pla');
        const serverRank = ((user?.apexAccount ?? null) != null) ? await this.apexAccountService.getServerRankByAccountId(user.apexAccount.id): null;
        // ----------------------------------------------------------------------

        console.info('MILESTONE 2');

        // Platform -------------------------------------------------------------
        const platform = statistics?.global?.platform;
        const platformEmoji = await this.emojiService.findByName(
            platformToEmojiNameDictionary[platform]
        );
        // ----------------------------------------------------------------------

        console.info('MILESTONE 3');

        // Total ---------------------------------------------------------------

        const totalStatsNames = {
            'kills': 'Zabójstwa',
            'damage': 'Obrażenia',
            'winning_kills': 'Zwycięskie zabójstwa',
            'top_3': 'Top 3',
            'kills_as_kill_leader': 'Zabójstwa jako lider zabójstw',
            'wins': 'Zwycięstwa',
        };

        const totalStats = [];

        for (const statName in totalStatsNames) {
            const statValue = statistics?.total[statName] ?? null;

            if (statValue == null || statValue.value == -1)
                continue;

            totalStats.push({
                name: totalStatsNames[statName],
                value: statValue.value,
            });
        }
        // ----------------------------------------------------------------------

        console.info('MILESTONE 4');

        // Status ---------------------------------------------------------------
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
        statusText.push(`> Lobby: ${(lobbyState == 'open') ? `Otwarte` : 'Zamknięte'} <:${lobbyStateEmoji?.name}:${lobbyStateEmoji.discordId}>`);
        statusText.push('ㅤ');
        // ----------------------------------------------------------------------

        console.info('MILESTONE 5');

        // Level ----------------------------------------------------------------
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
        // ----------------------------------------------------------------------

        embed.setTitle(`**<:${platformEmoji?.name}:${platformEmoji.discordId}> ${statistics?.global?.name}**`)

        console.info('MILESTONE 6');

        // If discord user is null then user plain data
        if (discordUser) {
            embed.setThumbnail(discordUser.displayAvatarURL())

            description.push(`Konto użytkownika <@${discordUser.id}>`);
        } else {
            embed.setThumbnail(statistics?.global?.avatar ?? statistics?.global?.rank.rankImg)

            description.push(`*Konto niepowiązane na serwerze PLA*`);
        }

        const urlFriendlyName = statistics?.global?.name.replaceAll(' ', '%20');
        embed.setURL(`https://apexlegendsstatus.com/profile/${statistics?.global?.platform}/${urlFriendlyName}`);

        console.info('MILESTONE 7');

        // Rank Content ---------------------------------------------------------
        description.push(`## <:${rankEmoji?.name}:${rankEmoji.discordId}> **${statistics?.global?.rank.rankName} ${rankDivToRomanDictionary[statistics?.global?.rank.rankDiv]}**`);
        
        if (statistics?.global?.rank.ladderPosPlatform != -1)
            description.push(`:arrow_up: TOP **${statistics?.global?.rank.ladderPosPlatform}** na ${platformAliases[platform]}`);

        if(serverRank)
            description.push(`<:${plaEmoji?.name}:${plaEmoji.discordId}> TOP **${serverRank}** na serwerze **PLA**`);

        description.push(`**:chart_with_upwards_trend: ${statistics?.global?.rank.rankScore}** LP`);
        
        description.push('ㅤ');
        // ----------------------------------------------------------------------

        console.info('MILESTONE 8');

        if (isOnline) {
            embed.addFields([
                {
                    name: `<:${statusEmoji?.name}:${statusEmoji.discordId}> **Online**`,
                    value: statusText.join('\n'),
                }
            ])
        } else {
            embed.addFields([
                {
                    name: `<:${statusEmoji?.name}:${statusEmoji.discordId}> **Offline**`,
                    value: statusText.join('\n'),
                    inline: true,
                }
            ])
        }

        console.info('MILESTONE 9');

        embed.addFields([
            {
                name: `<:${levelEmoji?.name}:${levelEmoji.discordId}> **Poziom ${level}**`,
                value: `> Poziom Prestiżu: **${levelPrestige}**
                > **${statistics?.global?.toNextLevelPercent}%** do następnego poziomu
                ㅤ`,
                inline: true,
            }
        ]);

        console.info('MILESTONE 10');

        // Total Stats ----------------------------------------------------------
        const totalStatsText = [];

        for (const stat of totalStats) {
            totalStatsText.push(`> **${stat?.name}**: \`${stat.value}\``);
        }

        totalStatsText.push('ㅤ');

        embed.addFields([
            {
                name: `**:globe_with_meridians:  Globalne Statystyki**`,
                value: totalStatsText.join('\n'),
            }
        ]);
        // ----------------------------------------------------------------------

        console.info('MILESTONE 11');

        // Legend ----------------------------------------------------------------

        const legend = statistics?.legends?.selected;
        const stats = legend?.data;

        const legendText = [];

        for (const stat of stats) {
            legendText.push(`> **${stat?.name}**: \`${stat.value}\``);
        }

        if (legendText.length == 0)
            legendText.push(`> Brak statystyk`);

        console.info('MILESTONE 12');

        embed.addFields([
            {
                name: `:radio_button:  Wybrana Legenda: **${legend?.LegendName}**`,
                value: legendText.join('\n'),
                inline: false,
            }
        ]);

        console.info('MILESTONE 12.5');

        if (legend?.ImgAssets?.banner)
            embed.setImage(legend?.ImgAssets?.banner);
        // ----------------------------------------------------------------------

        console.info('MILESTONE 13');

        // If some data couldn't be fetched add info to footer
        if (statistics?.global?.rank.ladderPosPlatform == -1 || !serverRank) {
            embed.setFooter({
                text: 'Polskie Legendy Apex • Dane są aktualizowane jedynie jeśli założony jest odpowiedni tracker, mogą być więc nieaktualne',
                iconURL: this.configService.get<string>('images.logo-transparent')
            })
        }

        embed.setDescription(description.join('\n'));

        console.info('MILESTONE 14');

        console.groupEnd();

        return embed;
    }

    /**
     * Get basic embed with logo and color
     * @returns basic embed with logo and color
     */
    private getBasicStatisticsEmbed() {
        return new EmbedBuilder()
            .setAuthor({
                name: "Polskie Legendy Apex • Dane są aktualizowane jedynie jeśli założony jest odpowiedni tracker, mogą być więc nieaktualne",
                // url: "https://www.google.pl",
                iconURL: "https://www.freepnglogos.com/uploads/apex-legends-logo-png/apex-legends-transparent-picture-20.png",
            })
            .setFooter({
                text: 'Polskie Legendy Apex',
                iconURL: this.configService.get<string>('images.logo-transparent')
            })
            .setColor(this.configService.get<ColorResolvable>('embeds.color-primary'))
            .setTimestamp();
    }

}
