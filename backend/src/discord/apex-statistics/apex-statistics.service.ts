import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApexApiService } from 'src/apex-api/apex-api.service';
import { ApexAccountService } from 'src/database/entities/apex-account/apex-account.service';
import { UserService } from 'src/database/entities/user/user.service';
import { DiscordService } from '../discord.service';
import { handleStatisticsDiscordCommandDto } from '../commands/dtos/handle-statistics-discord-command.dto';
import { CacheType, ChatInputCommandInteraction, ColorResolvable, EmbedBuilder, GuildMember, PermissionsBitField } from 'discord.js';
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
     * @param interaction 
     * @param options 
     */
    public async handleStatisticsDiscordCommand(interaction: ChatInputCommandInteraction<CacheType>, options: handleStatisticsDiscordCommandDto) {
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

        const embed = await this.getStatisticsEmbed(statistics, options.user, user);

        interaction.editReply({ embeds: [embed] });
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

        const discordUser = user ? await this.discordService.getMemberById(user.discordId) : null;

        const embed = await this.getStatisticsEmbed(statistics, discordUser, user);

        interaction.editReply({ embeds: [embed] });
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

    public async createUser(userDiscordId, isAdmin): Promise<UserEntity> {
        console.log(`Creating user ${userDiscordId} with admin: ${isAdmin}`);
        return await this.userService.create({
            discordId: userDiscordId,
            isAdmin: isAdmin,
        });
    }

    private async getStatisticsEmbed(statistics: PlayerStatistics, discordUser: GuildMember, user: UserEntity): Promise<EmbedBuilder> {
        const embed = this.getBasicStatisticsEmbed();
        const description = [];
        const rankToRoleNameDictionary = this.apexAccountService.rankToRoleNameDictionary;
        const rankToRoleColorDictionary = this.apexAccountService.rankToRoleColorDictionary;
        const platformToEmojiNameDictionary = this.apexAccountService.platformToEmojiNameDictionary;
        const rankDivToRomanDictionary = this.apexAccountService.rankDivToRomanDictionary;
        const platformAliases = this.apexAccountService.platformAliases;

        embed.setColor(rankToRoleColorDictionary[statistics?.global?.rank?.rankName]);

        // Rank -----------------------------------------------------------------
        const rankEmoji = await this.emojiService.findByName(
            rankToRoleNameDictionary[statistics?.global?.rank.rankName]
        );
        const plaEmoji = await this.emojiService.findByName('pla');
        const serverRank = ((user?.apexAccount ?? null) != null) ? await this.apexAccountService.getServerRankByAccountId(user.apexAccount.id): null;
        // ----------------------------------------------------------------------

        // Platform -------------------------------------------------------------
        const platform = statistics?.global?.platform;
        const platformEmoji = await this.emojiService.findByName(
            platformToEmojiNameDictionary[platform]
        );
        // ----------------------------------------------------------------------

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

        // Rank Content ---------------------------------------------------------
        description.push(`## <:${rankEmoji?.name}:${rankEmoji.discordId}> **${statistics?.global?.rank.rankName} ${rankDivToRomanDictionary[statistics?.global?.rank.rankDiv]}**`);
        
        if (statistics?.global?.rank.ladderPosPlatform != -1)
            description.push(`:arrow_up: TOP **${statistics?.global?.rank.ladderPosPlatform}** na ${platformAliases[platform]}`);

        if(serverRank)
            description.push(`<:${plaEmoji?.name}:${plaEmoji.discordId}> TOP **${serverRank}** na serwerze **PLA**`);

        description.push(`**:chart_with_upwards_trend: ${statistics?.global?.rank.rankScore}** LP`);
        
        description.push('ㅤ');
        // ----------------------------------------------------------------------

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

        const levelText = [];

        if (levelPrestige > 0)
            levelText.push(`> Poziom Prestiżu: **${levelPrestige}**`);

        levelText.push(`> **${statistics?.global?.toNextLevelPercent}%** do następnego poziomu`);
        levelText.push('ㅤ');

        embed.addFields([
            {
                name: `<:${levelEmoji?.name}:${levelEmoji.discordId}> **Poziom ${level}**`,
                value: levelText.join('\n'),
                inline: true,
            }
        ]);

        // Total Stats ----------------------------------------------------------
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
        // ----------------------------------------------------------------------

        // Legend ----------------------------------------------------------------

        const legend = statistics?.legends?.selected;
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

        if (legend?.ImgAssets?.banner) {
            const urlFriendlyBanner = legend?.ImgAssets?.banner.replaceAll(' ', '%20');
            embed.setImage(urlFriendlyBanner);
        }
        // ----------------------------------------------------------------------

        // If some data couldn't be fetched add info to footer
        if (statistics?.global?.rank.ladderPosPlatform == -1 || !serverRank) {
            embed.setFooter({
                text: 'Polskie Legendy Apex • Dane są aktualizowane jedynie jeśli założony jest odpowiedni tracker, mogą być więc nieaktualne',
                iconURL: this.configService.get<string>('images.logo-transparent')
            })
        }

        embed.setDescription(description.join('\n'));

        return embed;
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

}
