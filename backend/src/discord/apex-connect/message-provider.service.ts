import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MessageOptions } from "child_process";
import { ActionRowBuilder, ApplicationCommand, ButtonBuilder, ButtonStyle, ColorResolvable, EmbedBuilder, GuildResolvable, InteractionReplyOptions, Message } from "discord.js";
import { PlayerStatistics } from "src/apex-api/player-statistics.interface";
import { ApexAccountEntity } from "src/database/entities/apex-account/entities/apex-account.entity";
import { SynchronizationStatusOptions } from "./apex-sync.service";
import { DiscordService } from "../discord.service";

@Injectable()
export class MessageProviderService {

    private commands: ApplicationCommand[] = [];

    constructor(
        private readonly configService: ConfigService,
        private readonly discordService: DiscordService,
    ) {
        this.init();
    }

    private async init() {
        await this.discordService.isReady();
        
        this.commands.push(await this.discordService.getApplicationCommand('połącz') as ApplicationCommand);
    }

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

        // const linkEAButton = new ButtonBuilder()
        //     .setStyle(ButtonStyle.Link)
        //     .setLabel('Masz konto Steam?')
        //     .setURL('https://help.ea.com/pl/help/pc/link-ea-and-steam/')
        //     .setEmoji('🔗');

        const linkSteam = new ButtonBuilder()
            .setStyle(ButtonStyle.Secondary)
            .setLabel('Mam konto Steam')
            .setCustomId('apex-link-steam')
            .setEmoji('🔗');

        const confirmButton = new ButtonBuilder()
            .setStyle(ButtonStyle.Success)
            .setLabel('Tak, to moje konto')
            .setCustomId('apex-connect-confirm')
            .setEmoji('✅');

        const row = new ActionRowBuilder()
            .addComponents(linkSteam, confirmButton);

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

    public getConnectSteamMessage(nickname: string, platform: string): InteractionReplyOptions {

        const urlFriendlyName = nickname.replaceAll(' ', '%20');
        const url = `https://apexlegendsstatus.com/profile/${platform}/${urlFriendlyName}`;

        const tutorialImage = this.configService.get<string>('images.steam-connect-tutorial');
        const steamImage = this.configService.get<string>('images.steam-logo');

        const connectCommand = this.commands.find(command => command.name == 'połącz') ?? null;

        console.info(url, tutorialImage);

        const description = [];

        description.push(`### Nawet jeśli posiadasz konto Steam, wciąż musisz użyć nicku platformy Origin.`);
        description.push(`Aby znaleźć swój nick Origin, możesz odwiedzić [link](${url}) poniżej, wybrać swoje konto a następnie znaleźć swój nick Origin w sekcji \`Account info >> Username aliases\``);
        description.push(`### ` + url);
        description.push('');
        description.push(`Gdy już znajdziesz swój nick Origin, użyj komendy </${connectCommand.name}:${connectCommand.id}> ponownie.`);

        const linkEAButton = new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel('Znajdź swoje konto Steam')
            .setURL(url)
            .setEmoji('🔎');

        const row = new ActionRowBuilder()
            .addComponents(linkEAButton);

        // Are you sure this is your account?
        const embed = this.getBasicEmbed()
            .setTitle('Łączenie konta Steam')
            .setDescription(description.join('\n'))
            .setURL(`https://help.ea.com/pl/help/pc/link-ea-and-steam/`)
            .setImage(tutorialImage)
            .setThumbnail(steamImage);

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

    public getAccountExistButNotLinkedMessage(account: ApexAccountEntity) {
        // interaction.reply({ content: `Konto o nicku ${options.username} jest już połączone.`, ephemeral: true});
        const embed = this.getBasicEmbed()
            
        // Check if it's the same user
        embed.setTitle('Podane konto było wcześniej połączone')
        embed.setDescription(`Podane konto o nazwie **${account.name}** było już raz połączone na serwerze PLA. Zostanie ono powiązane z Twoim kontem Discord. Czy kontynuować?`)
        embed.setThumbnail(this.configService.get<string>('images.danger'));


        const cancelButton = new ButtonBuilder()
            .setStyle(ButtonStyle.Danger)
            .setLabel('Anuluj')
            .setCustomId('apex-connect-cancel')
            .setEmoji('⚠');

        const confirmButton = new ButtonBuilder()
            .setStyle(ButtonStyle.Success)
            .setLabel('Kontynuuj')
            .setCustomId('apex-connect-continue')
            .setEmoji('✅');

        const row = new ActionRowBuilder()
            .addComponents(cancelButton, confirmButton);

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

    public getCanceledMessage() {
        const embed = this.getBasicEmbed()
            .setTitle('Anulowano łączenie konta')
            .setDescription('Operacja anulowana przez użytkownika. Jeśli potrzeba, prosimy spróbować ponownie.')
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

    public getSynchronizationStatusEmbed(options: SynchronizationStatusOptions): EmbedBuilder {

        console.log(options?.lastSynchronizationTimestamp, options?.nextSynchronizationTimestamp)

        const embed = this.getBasicEmbed()
            .setTitle('Synchronizacja statystyk Apex Legends')

        const connectCommand = this.commands.find(command => command.name == 'połącz') ?? null;
        
        if (options.status == 'idle') {
            embed.setDescription('**Status:** *Oczekiwanie...*');

            if (options.lastSynchronizationTimestamp)
                embed.addFields({
                    name: 'Ostatnia aktualizacja',
                    value: `<t:${options.lastSynchronizationTimestamp}:T>`,
                    inline: true,
                });

            if (options.nextSynchronizationTimestamp)
                embed.addFields({
                    name: 'Następna aktualizacja',
                    value: `<t:${options.nextSynchronizationTimestamp}:R>`,
                    inline: true,
                });

            if (options.total)
                embed.addFields({
                    name: 'Ostatnio zaktualizowano',
                    value: `${options.total} kont`,
                });


            console.log(connectCommand);

            if (!!connectCommand)
                embed.addFields({
                    name: 'Jak się połączyć?',
                    value: `Aby połączyć konto użyj komendy </${connectCommand.name}:${connectCommand.id}>`,
                    inline: true,
                })

            embed.setThumbnail(this.configService.get<string>('images.success'));
        }

        if (options.status == 'synchronizing') {
            embed.setDescription('**Status:** *Synchronizowanie...*');
            embed.setThumbnail(this.configService.get<string>('images.loading'));

            if (options.progress)
                embed.addFields({
                    name: 'Ogólny progres synchronizacji',
                    value: `${options.progress} / ${options.total}`,
                });

            else
                embed.addFields({
                    name: 'Rozpoczynam aktualizację...',
                    value: `Ilość połączonych kont: ${options.total}`,
                });


            if (options.currentAccount)
                embed.addFields({
                    name: 'Aktualizowany gracz',
                    value: options.currentAccount.name + ' ' + `[<@${options.currentAccount.discordId}>]`,
                });

            if (options.attempt) {
                let progressText = '';
    
                if (options.attempt <= 1)
                    progressText = 'Pobieranie danych z API';
    
                if (options.attempt > 1)
                    progressText = `Próba nieudana! Ponawianie [${options.attempt}/${3}]`;
    
                embed.addFields({
                    name: 'Postęp aktualizacji',
                    value: progressText,
                });
            }

        }

        if (options.status == 'error') {
            embed.setDescription('**Status:** *Wystąpił błąd podczas aktualizowania kont Apex Legends...*');
            embed.setThumbnail(this.configService.get<string>('images.danger'));

            if (options.lastSynchronizationTimestamp)
                embed.addFields({
                    name: 'Ostatnia próba aktualizacji',
                    value: `<t:${options.lastSynchronizationTimestamp}:R>`,
                });

            if (options.nextSynchronizationTimestamp)
                embed.addFields({
                    name: 'Następna aktualizacja',
                    value: `<t:${options.nextSynchronizationTimestamp}:R>`,
                });
        }

        if (options.status == 'role-updating') {
            embed.setDescription('**Status:** *Aktualizowanie ról...*');
            embed.setThumbnail(this.configService.get<string>('images.loading'));
        }



        // embed.addFields({
        //     name: 'Ostatnia aktualizacja',
        //     value: `<t:${options.lastSynchronizationTimestamp}:R>`,
        // });

        return embed;
    }

    public getMessageSendConfirmation (): InteractionReplyOptions {
        const embed = this.getBasicEmbed()
            .setTitle('Czy na pewno chcesz stworzyć wiadomość?')
            .setDescription(`Ten typ wiadomości, będzie przekierowany na domyślny kanał, niezależnie od wyboru, czy kontynuować?`)
            .setThumbnail(this.configService.get<string>('images.danger'));

        const confirmButton = new ButtonBuilder()
            .setStyle(ButtonStyle.Success)
            .setLabel(`Tak, stwórz wiadomość`)
            .setCustomId('apex-create-message-confirm')
            .setEmoji('✅');

        const row = new ActionRowBuilder()
            .addComponents(confirmButton);

        return {
            embeds: [embed],
            components: [row as any],
            ephemeral: true,
        }
    }

    public getAccountNotFoundMessage (username, platform): InteractionReplyOptions {
        const linkSteam = new ButtonBuilder()
            .setStyle(ButtonStyle.Secondary)
            .setLabel('Mam konto Steam')
            .setCustomId('apex-link-steam')
            .setEmoji('🔗');

        const row = new ActionRowBuilder()
            .addComponents(linkSteam);

        const embed = this.getBasicEmbed()
            .setTitle(':x: Nie znaleziono konta')
            .setDescription(`Nie znaleziono gracza o nicku **${username}** na platformie **${platform}**.`)
            .setThumbnail(this.configService.get<string>('images.unresolved'))

            return {
                embeds: [embed],
                components: [row as any],
                ephemeral: true,
            }
    }

    public getChannelNotFoundMessage (): InteractionReplyOptions {
        const embed = this.getBasicEmbed()
            .setTitle('Nie znaleziono kanału')
            .setDescription(`Nie znaleziono kanału który mógłby zostać przypisany do wiadomości. Sprawdź czy kanał jest ustawiony i spróbuj ponownie.`)
            .setThumbnail(this.configService.get<string>('images.danger'));

        return {
            embeds: [embed],
            components: [],
            ephemeral: true,
        }
    }
}