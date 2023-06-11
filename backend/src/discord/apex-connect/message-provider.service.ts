import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ColorResolvable, EmbedBuilder, InteractionReplyOptions } from "discord.js";
import { PlayerStatistics } from "src/apex-api/player-statistics.interface";
import { ApexAccountEntity } from "src/database/entities/apex-account/entities/apex-account.entity";

@Injectable()
export class MessageProviderService {

    constructor(
        private readonly configService: ConfigService,
    ) {}

    /**
     * Get basic embed with logo and color
     * @returns basic embed with logo and color
     */
    public getBasicEmbed() {
        return new EmbedBuilder()
            .setAuthor({
                name: 'Polskie Legendy Apex',
                iconURL: this.configService.get<string>('images.logo-transparent')
            })
            .setColor(this.configService.get<ColorResolvable>('embeds.color-primary'))
            .setTimestamp();
    }

    /**
     * Get message that asks user to confirm if provided player data is correct
     * @param playerData player data to confirm
     * @returns message that asks user to confirm if provided player data is correct
     */
    public getPlayerDataConfirmMessage(playerData: PlayerStatistics): InteractionReplyOptions {

        const linkEAButton = new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel('Masz konto Steam?')
            .setURL('https://help.ea.com/pl/help/pc/link-ea-and-steam/')
            .setEmoji('🔗');

        const confirmButton = new ButtonBuilder()
            .setStyle(ButtonStyle.Success)
            .setLabel('Tak, to moje konto')
            .setCustomId('apex-connect-confirm')
            .setEmoji('✅');

        const row = new ActionRowBuilder()
            .addComponents(linkEAButton, confirmButton);

        const rankDivisionRomanSystem = {
            1: 'I',
            2: 'II',
            3: 'III',
            4: 'IV',
        }

        const rankDivision = rankDivisionRomanSystem[playerData.global.rank.rankDiv] || '';

        // Are you sure this is your account?
        const embed = this.getBasicEmbed()
            .setTitle('Czy na pewno to twoje konto?')
            .setDescription(`Jeśli to na pewno twoje konto, kliknij przycisk poniżej. Jeśli nie, upewnij się że podałeś poprawny nick i platformę, a następnie spróbuj ponownie. Pamiętaj że nick musi dotyczyć konta EA, a nie konta Steam.`)
            .addFields(
                {
                    name: 'Nick',
                    value: playerData.global.name,
                    inline: true,
                },
                {
                    name: 'Poziom',
                    value: playerData.global.level.toString(),
                    inline: true,
                },
                {
                    name: 'Aktualnie wybrana legenda',
                    value: playerData.realtime.selectedLegend,
                    inline: true,
                },
                {
                    name: 'Ranga',
                    value: playerData.global?.rank?.rankName + " " + rankDivision,
                    inline: true,
                },
            )
            .setThumbnail(playerData.global.avatar)

            return {
                embeds: [embed],
                components: [row as any],
                ephemeral: true,
            }
    }

    public getAccountExistMessage(account: ApexAccountEntity, sameUser = false) {
        // interaction.reply({ content: `Konto o nicku ${options.username} jest już połączone.`, ephemeral: true});
        const embed = this.getBasicEmbed()
            
        // Check if it's the same user
        if (sameUser) {
            embed.setTitle('Jesteś już połączony z tym kontem')
            embed.setDescription(`Podane konto o nazwie **${account.name}** jest już połączone z twoim kontem Discord. Jeśli chcesz je odłączyć, możesz to zrobić używając komendy \`/odłącz\`.`)
            embed.setThumbnail(this.configService.get<string>('images.success'));

            return {
                embeds: [embed],
                components: [],
            }
        }

        // Account is connected to another user
        embed.setTitle('Konto jest już połączone z innym użytkownikiem')
        embed.setDescription(`Konto o nazwie **${account.name}** jest już połączone z użytkownikiem <@${account.user.discordId}>. Jeśli chcesz możesz wciąż połączyć to konto z twoim kontem, ale poprzednie połączenie zostanie usunięte. Użytkownik otrzyma powiadomienie o tym fakcie.`)
        embed.setThumbnail(this.configService.get<string>('images.danger'));

        const confirmButton = new ButtonBuilder()
            .setStyle(ButtonStyle.Danger)
            .setLabel('Odbierz konto użytkownikowi')
            .setCustomId('apex-connect-continue')
            .setEmoji('⚠');

        const row = new ActionRowBuilder()
            .addComponents(confirmButton);

        return {
            embeds: [embed],
            components: [row as any],
        }
    }

    public getAlreadyConnectedMessage(account: ApexAccountEntity) {

        const embed = this.getBasicEmbed()
            .setTitle('Posiadasz już inne połączone konto')
            .setDescription(`Twoje konto Discord jest już połączone z kontem o nazwie **${account.name}**. Jeśli chcesz je odłączyć, możesz to zrobić używając komendy \`/odłącz\` lub skontaktować się z administracją. Alternatywnie możesz kontynuować proces, ale poprzednie połączenie zostanie usunięte.`)
            .setThumbnail(this.configService.get<string>('images.danger'));

        const confirmButton = new ButtonBuilder()
            .setStyle(ButtonStyle.Danger)
            .setLabel('Kontynuuj mimo wszystko')
            .setCustomId('apex-connect-continue')
            .setEmoji('⚠');

        const row = new ActionRowBuilder()
            .addComponents(confirmButton);

        return {
            embeds: [embed],
            components: [row as any],
        }
    }

    /**
     * Get message that informs user that player data confirmation has expired
     * @returns message that informs user that player data confirmation has expired
     */
    public getPlayerDataExpiredMessage() {
        const embed = this.getBasicEmbed()
            .setTitle('Nie potwierdzono wyboru.')
            .setDescription('Nie potwierdzono wyboru w wyznaczonym czasie. Spróbuj ponownie.')
            .setThumbnail(this.configService.get<string>('images.logo-transparent'));

        return {
            embeds: [embed],
            components: [],
        }
    }

    /**
     * Await for player to be online and choose provided legend.
     * @param legendName legend that player should have
     * @param online if player is online
     * @param expireTimestamp discord message expiration timestamp
     */
    public getConnectAccountMessage(legendName: string, online: boolean, expireTimestamp: number, legendImage = this.configService.get('images.logo-transparent'), progress): InteractionReplyOptions {
    
        const embed = this.getBasicEmbed();

        if (!online) {
            embed.setTitle(`Zaloguj się do gry`)
            embed.setDescription('Aby połączyć konto, musisz znaleźć się w lobby, zalogowany na twoim koncie.');
            embed.setThumbnail(this.configService.get<string>('images.loading'));
            
            embed.addFields({
                name: 'Proces wygasa',
                value: `<t:${expireTimestamp}:R>`
            })
        } else {
            embed.setTitle(`Wybierz legendę ${progress.current} / ${progress.target}`)
            embed.setDescription('Aby połączyć konto musisz wybrać odpowiednią legendę w grze. Po wybraniu legendy opuść ekran wyboru legend, pozostaw grę w lobby i poczekaj na aktualizację. Jeśli legenda nie jest wykrywana, spróbuj zmienić jej skórkę.');
            embed.setThumbnail(this.configService.get<string>('images.loading'));
            embed.setImage(legendImage);
            
            embed.addFields(
                {
                    name: 'Legenda do wybrania',
                    value: legendName,
                },
                {
                    name: 'Proces wygasa',
                    value: `<t:${expireTimestamp}:R>`
                }
            )
        }


        return {
            embeds: [embed],
            components: [],
        }
    }

    /**
     * Get message that informs user that action has expired
     */
    public getExpirationMessage() {
        const embed = this.getBasicEmbed()
            .setTitle('Czas na wykonanie akcji wygasł')
            .setDescription('Minął maksymalny czas na wykonanie akcji. Spróbuj ponownie.')
            .setThumbnail(this.configService.get<string>('images.logo-transparent'));
            
        return {
            embeds: [embed],
            components: [],
        }
    }

    /**
     * Get message that informs user that action has expired
     * @param error error message
     * @returns message that informs user that action has expired
     */
    public getErrorMessage(errorText: string) {
        const embed = this.getBasicEmbed()
            .setTitle('Wystąpił błąd')
            .setDescription('Przepraszamy, coś poszło nie tak. Spróbuj ponownie później lub skontaktuj się z administracją.')
            .setThumbnail(this.configService.get<string>('images.danger'));

        if (errorText) {
            embed.addFields({
                name: 'Treść Błędu',
                value: errorText,
            });
        }

        return {
            embeds: [embed],
            components: [],
        }
    }

    public getSuccessMessage(playerData: PlayerStatistics): InteractionReplyOptions {
        const embed = this.getBasicEmbed()
        .setTitle('Połączono konto!')
        .setDescription('Twoje konto zostało połączone. Twoje statystyki będą teraz synchronizowane z twoim kontem Discord.')
        .setThumbnail(this.configService.get<string>('images.success'))

        embed.addFields(
            {
                name: 'Nick',
                value: playerData.global.name,
                inline: true,
            },
            {
                name: 'Poziom',
                value: playerData.global.level.toString(),
                inline: true,
            },
            {
                name: 'Aktualnie wybrana legenda',
                value: playerData.realtime.selectedLegend,
                inline: true,
            }
        );

        return {
            embeds: [embed],
            components: [],
        }
    }

    public getDisconnectConfirmMessage(account: ApexAccountEntity): InteractionReplyOptions {
        const embed = this.getBasicEmbed()
            .setTitle('Czy na pewno chcesz odłączyć konto?')
            .setDescription(`Jesteś pewien że chcesz odłączyć konto **${account.name}** od twojego konta PLA? Jeśli tak, kliknij przycisk poniżej.`)
            .setThumbnail(this.configService.get<string>('images.danger'));

        const confirmButton = new ButtonBuilder()
            .setStyle(ButtonStyle.Danger)
            .setLabel(`Tak, odłącz konto ${account.name}`)
            .setCustomId('apex-disconnect-confirm')
            .setEmoji('✅');

        const row = new ActionRowBuilder()
            .addComponents(confirmButton);

        return {
            embeds: [embed],
            components: [row as any],
            ephemeral: true,
        }
    }

    public getDisconnectSuccessMessage(account: ApexAccountEntity): InteractionReplyOptions {
        const embed = this.getBasicEmbed()
            .setTitle('Odłączono konto!')
            .setDescription(`Konto **${account.name}** zostało odłączone od twojego konta Discord. Twoje statystyki nie będą już aktualizowane.`)
            .setThumbnail(this.configService.get<string>('images.success'));

        return {
            embeds: [embed],
            components: [],
        }
    }
}