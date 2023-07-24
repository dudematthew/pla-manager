import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApexApiService } from 'src/apex-api/apex-api.service';
import { ApexAccountService } from 'src/database/entities/apex-account/apex-account.service';
import { UserService } from 'src/database/entities/user/user.service';
import { DiscordService } from '../discord.service';
import { handleStatisticsDiscordCommandDto } from '../commands/dtos/handle-statistics-discord-command.dto copy';
import { CacheType, ChatInputCommandInteraction, ColorResolvable, EmbedBuilder, GuildMember } from 'discord.js';
import { ApexAccountEntity } from 'src/database/entities/apex-account/entities/apex-account.entity';
import { PlayerStatistics } from 'src/apex-api/player-statistics.interface';
import { UserEntity } from 'src/database/entities/user/user.entity';
import { EmojiService } from 'src/database/entities/emoji/emoji.service';

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
        Interaction.deferReply();
        
        const user = await this.userService.findByDiscordId(options.user.id);

        // todo: if user not found, create new user

        if (!user) {
            Interaction.editReply(`Nie znaleziono użytkownika **${options.user.displayName}**`);
            return;
        }

        const apexAccount = user.apexAccount;

        if (!apexAccount) {
            Interaction.editReply(`Użytkownik **${options.user.displayName}** nie ma przypisanego konta Apex Legends`);
            return;
        }

        const statistics = await this.apexApiService.getPlayerStatisticsByUID(apexAccount.uid, apexAccount.platform as 'PC' | 'PS4' | 'X1' | 'SWITCH', {});

        if (!statistics) {
            Interaction.editReply(`Nie znaleziono statystyk dla użytkownika **${options.user.displayName}**`);
            return;
        }

        // Interaction.editReply(`Statystyki użytkownika **${options.user.displayName}**`);

        const embed = await this.getStatisticsEmbed(statistics, options.user);

        Interaction.editReply({ embeds: [embed] });
    }

    private async getStatisticsEmbed(statistics: PlayerStatistics, user: GuildMember): Promise<EmbedBuilder> {
        const embed = this.getBasicStatisticsEmbed();
        const description = [];
        const rankToRoleNameDictionary = this.apexAccountService.rankToRoleNameDictionary;
        const rankToRoleColorDictionary = this.apexAccountService.rankToRoleColorDictionary;
        const platformToEmojiNameDictionary = this.apexAccountService.platformToEmojiNameDictionary;
        const rankDivToRomanDictionary = this.apexAccountService.rankDivToRomanDictionary;

        embed.setColor(rankToRoleColorDictionary[statistics.global.rank.rankName]);

        // Rank -----------------------------------------------------------------
        const rankEmoji = await this.emojiService.getDiscordEmojiByName(
            rankToRoleNameDictionary[statistics.global.rank.rankName]
        );
        // ----------------------------------------------------------------------

        // Platform -------------------------------------------------------------
        const platform = statistics.global.platform;
        const platformEmoji = await this.emojiService.getDiscordEmojiByName(
            platformToEmojiNameDictionary[platform]
        );
        // ----------------------------------------------------------------------


        // Status ---------------------------------------------------------------
        const isOnline = statistics.realtime.isOnline;
        const isPlaying = statistics.realtime.isInGame;
        const partyFull = statistics.realtime.partyFull;
        const lobbyState = statistics.realtime.lobbyState == 'open' ? 'open' : 'closed';
        const currentStateSinceTimestamp = statistics.realtime.currentStateSinceTimestamp;

        const statusEmojiName = !isOnline ? 'offline' : isPlaying ? 'playing' : 'online';
        const statusEmoji = await this.emojiService.getDiscordEmojiByName(statusEmojiName);

        const lobbyStateEmoji = await this.emojiService.getDiscordEmojiByName(lobbyState);

        const statusText = [];
        if (isOnline) {
            statusText.push(`> ` + (isPlaying ? 'Rozpoczął grę' : 'Wszedł do lobby') + ` <t:${currentStateSinceTimestamp}:R>`);
            statusText.push(`> Skład: ${partyFull ? 'Pełny :x:' : 'Niepełny :white_check_mark:'}`);
            statusText.push('ㅤ');
        }
            
        statusText.push(`> Lobby: ${(lobbyState == 'open') ? `Otwarte` : 'Zamknięte'} <:${lobbyStateEmoji.name}:${lobbyStateEmoji.id}>`);
        // ----------------------------------------------------------------------

        // Level ----------------------------------------------------------------
        const level = statistics.global.level;
        const levelPrestige = statistics.global.levelPrestige;
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
        
        const levelEmoji = await this.emojiService.getDiscordEmojiByName(levelEmojiName) ?? null;

        // ----------------------------------------------------------------------

        // If discord user is null then user plain data
        if (user) {
            embed
                .setTitle(`**<:${platformEmoji.name}:${platformEmoji.id}> ${statistics.global.name}**`)
                .setThumbnail(user.displayAvatarURL())

            description.push(`Konto użytkownika <@${user.id}>`);
        } else {
            embed
                .setTitle(statistics.global.name)
                .setThumbnail(statistics.global.avatar)
        }

        const urlFriendlyName = statistics.global.name.replace(' ', '%20');
        console.log(`https://apexlegendsstatus.com/profile/${statistics.global.platform}/${urlFriendlyName}`)
        embed.setURL(`https://apexlegendsstatus.com/profile/${statistics.global.platform}/${urlFriendlyName}`);

        // Rank Content ---------------------------------------------------------
        description.push(`## <:${rankEmoji.name}:${rankEmoji.id}> **${statistics.global.rank.rankName} ${rankDivToRomanDictionary[statistics.global.rank.rankDiv]}** [**${statistics.global.rank.rankScore}** LP]`);
        
        if (statistics.global.rank.ladderPosPlatform != -1)
            description.push(`:arrow_up: TOP **${statistics.global.rank.ladderPosPlatform}** na ${platform}`);
        
        description.push('ㅤ');
        // ----------------------------------------------------------------------

        if (isOnline) {
            embed.addFields([
                {
                    name: `<:${statusEmoji.name}:${statusEmoji.id}> **Online**`,
                    value: statusText.join('\n'),
                }
            ])
        } else {
            embed.addFields([
                {
                    name: `<:${statusEmoji.name}:${statusEmoji.id}> **Offline**`,
                    value: statusText.join('\n'),
                    inline: true,
                }
            ])
        }

        embed.addFields([
            {
                name: `<:${levelEmoji.name}:${levelEmoji.id}> **Poziom ${level}**`,
                value: `> Poziom Prestiżu: **${levelPrestige}**
                > **${statistics.global.toNextLevelPercent}%** do następnego poziomu
                ㅤ`,
                inline: true,
            }
        ]);

        // Legend ----------------------------------------------------------------

        const legend = statistics.legends.selected;
        const stats = legend.data;

        const legendText = [];

        for (const stat of stats) {
            legendText.push(`> **${stat.name}**: \`${stat.value}\``);
        }


        embed.addFields([
            {
                name: `Wybrana Legenda: **${legend.LegendName}**`,
                value: legendText.join('\n'),
                inline: false,
            }
        ]);

        embed.setImage(legend.ImgAssets.banner);

        // ----------------------------------------------------------------------

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
