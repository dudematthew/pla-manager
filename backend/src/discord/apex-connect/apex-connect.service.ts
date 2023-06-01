import { Injectable } from '@nestjs/common';
import { MessageData } from '../discord.listeners';
import { APIInteractionGuildMember, ActionRowBuilder, ButtonBuilder, ButtonStyle, CacheType, ChatInputCommandInteraction, ColorResolvable, EmbedBuilder, GuildMember, InteractionReplyOptions, PermissionsBitField } from 'discord.js';
import { handleConnectCommandDto, platformAliases } from '../commands/dtos/handle-connect.command.dto';
import { ApexApiService } from 'src/apex-api/apex-api.service';
import { Logger } from '@nestjs/common';
import { PlayerStatistics } from 'src/apex-api/player-statistics.interface';
import { ConfigService } from '@nestjs/config';
import { ApexAccountService } from 'src/database/entities/apex-account/apex-account.service';
import { UserService } from 'src/database/entities/user/user.service';
import { UserEntity } from 'src/database/entities/user/user.entity';
import { ApexAccountEntity } from 'src/database/entities/apex-account/entities/apex-account.entity';
import { DiscordService } from '../discord.service';

@Injectable()
export class ApexConnectService {

    // Logger instance
    private logger = new Logger(ApexConnectService.name);

    // Time in which user has to log in in seconds
    private onlineExpirationTime = 120;
    // Time in which user has to choose legend in seconds
    private legendChangeExpirationTime = 120;

    private basicLegends = [
        'Bangalore',
        'Bloodhound',
        'Gibraltar',
        'Lifeline',
        'Pathfinder',
        'Wraith',
    ];

    constructor(
        private readonly apexApiService: ApexApiService,
        private readonly configService: ConfigService,
        private readonly apexAccountService: ApexAccountService,
        private readonly userService: UserService,
        private readonly discordService: DiscordService,
    ) {}

    public async handleConnectCommand(interaction: ChatInputCommandInteraction<CacheType>, options: handleConnectCommandDto) {
        const playerData = await this.apexApiService.getPlayerStatisticsByName(options.username, options.platform);

        console.log(`User ${interaction.user.username} requested to connect account ${options.username} on platform ${options.platform}. Got player data (global):`, playerData.global);

        this.logAccountData(playerData);

        if (typeof playerData?.errorCode !== "undefined") {
            interaction.reply({ content: `Nie znaleziono gracza o nicku ${options.username} na platformie ${platformAliases[options.platform]}.`, ephemeral: true});
            return;
        }

        // Send message with player data and ask user to confirm
        const confirmResponse = await interaction.reply(this.getPlayerDataConfirmMessage(playerData));

        const collectorFilter = i => i.user.id == interaction.user.id;

        let confirmation: any;

        try {
            confirmation = await confirmResponse.awaitMessageComponent({ filter: collectorFilter, time: 60000 });
        } catch (e) {
            await interaction.editReply(this.getPlayerDataExpiredMessage());
            return;
        }

        // if (confirmation.customId !== 'apex-connect-confirm') {
        //     this.logger.error(`Confirmation customId is not apex-connect-confirm. Received: ${confirmation.customId}`);
        //     return;
        // }

        // Account that could be connected to user
        const checkForAccount = await this.apexAccountService.findByUID(playerData.global.uid.toString());

        // Check if account already exists
        if (checkForAccount) {
            const sameUser = checkForAccount.user.discordId == interaction.user.id;

            const message = this.getAccountExistMessage(checkForAccount, sameUser);

            interaction.editReply(message);
            
            if (sameUser)
                return;

            const collectorFilter = i => i.user.id == interaction.user.id;

            let confirmation: any;

            try {
                confirmation = await interaction.channel.awaitMessageComponent({ filter: collectorFilter, time: 60000 });
            }
            catch (e) {
                await interaction.editReply(this.getPlayerDataExpiredMessage());
                return;
            }
        }

        // Account that is already connected to user
        const checkIfConnected = (await this.userService.findByDiscordId(interaction.user.id))?.apexAccount;

        // Check if user is already connected and it's not the same account
        if (checkIfConnected) {
            interaction.editReply(this.getAlreadyConnectedMessage(checkIfConnected));

            const collectorFilter = i => i.user.id == interaction.user.id;

            let confirmation: any;

            try {
                confirmation = await interaction.channel.awaitMessageComponent({ filter: collectorFilter, time: 60000 });
            }
            catch (e) {
                await interaction.editReply(this.getPlayerDataExpiredMessage());
                return;
            }
        }

        // Create timestamp for 60 seconds from now
        let expireTimestamp = Math.floor(Date.now() / 1000) + this.onlineExpirationTime;

        await interaction.editReply(this.getConnectAccountMessage('', false, expireTimestamp, undefined, { current: 0, target: 3 }));

        const isOnline = await this.awaitUserOnline(options.username, options.platform, this.onlineExpirationTime * 1000);
        
        if (!isOnline) {
            await interaction.editReply(this.getExpirationMessage());
            return;
        }

        const randomLegends = this.getRandomLegends(3);

        // Wait 3 times for user to choose legend
        for (let i = 0; i < 3; i++) {
            expireTimestamp = Math.floor(Date.now() / 1000) + this.legendChangeExpirationTime;

            const legendImage = playerData.legends.all[randomLegends[i]].ImgAssets.icon;

            await interaction.editReply(this.getConnectAccountMessage(randomLegends[i], true, expireTimestamp, legendImage, { current: i + 1, target: 3 }));

            const isLegendSelected = await this.awaitLegendChoice(randomLegends[i], options.username, options.platform, this.legendChangeExpirationTime * 1000);

            if (!isLegendSelected) {
                await interaction.editReply(this.getExpirationMessage());
                return;
            }
        }

        let user = await this.userService.findByDiscordId(interaction.user.id);

        // If user doesn't exist, create one
        if (!user) {
            user = await this.userService.create({
                discordId: interaction.user.id,
                isAdmin: interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator),
            });

            // If user is null (something went wrong), abort
            if (!user) {
                await interaction.editReply(this.getErrorEmbed("Nie udało się utworzyć twojego konta."));
                return;
            }
        }

        // If user already has apex account, delete it
        if (user.apexAccount) {
            console.log("User already has apex account, deleting...", user.apexAccount.name);
            await this.apexAccountService.remove(user.apexAccount.id);
        }

        if (checkForAccount) {
            console.log("Account already exists, deleting...", checkForAccount.name);
            await this.apexAccountService.remove(checkForAccount.id);
        }

        const newUser: UserEntity = await this.saveAccount(playerData, user);

        // If newUser is null (something went wrong), abort
        if (!newUser || !newUser.apexAccount) {
            await interaction.editReply(this.getErrorEmbed("Nie udało się powiązać twojego konta."));
            return;
        }

        // User has chosen legend, connect account
        await interaction.editReply(this.getSuccessMessage(playerData));
    }

    public async saveAccount(playerData: PlayerStatistics, user: UserEntity): Promise<UserEntity> {
        console.log("Saving account: ", playerData.global.name, user.id);
        const data = {
            user,
            name: playerData.global.name,
            uid: playerData.global.uid.toString(),
            avatarUrl: playerData.global?.avatar ?? '',
            platform: playerData.global?.platform ?? '',
            rankScore: playerData.global?.rank?.rankScore ?? 0,
            rankName: playerData.global?.rank?.rankName ?? '',
            rankDivision: playerData.global?.rank?.rankDiv.toString() ?? '',
            rankImg: playerData.global?.rank?.rankImg ?? '',
            level: playerData.global?.level ?? 0,
            percentToNextLevel: playerData.global?.toNextLevelPercent ?? 0,
            brTotalKills: playerData.total?.kills?.value ?? 0,
            brTotalWins: 0 /* playerData.total.wins.value */,
            brTotalGamesPlayed: 0/* playerData.total?.games */,
            brKDR: parseInt(playerData.total?.kd?.value ?? '0') ?? 0,
            brTotalDamage: playerData.total?.damage?.value ?? 0,
            lastLegendPlayed: playerData.realtime?.selectedLegend ?? '',
        };

        const profile = await this.apexAccountService.create(data);

        if (!profile) {
            return null;
        }

        user.apexAccount = profile;

        await this.userService.update(user.id, user);

        return user;
    }

    public async handlePrivateMessage(messageData: MessageData) {
        // console.log("Received private message: ", messageData);
    }

    /**
     * Send account data as a private message to developer
     * Limit to 2000 characters
     * @param playerData player data to send
     */
    private async logAccountData(playerData: PlayerStatistics) {
        const data = {
            realtime: playerData.realtime,
            total: playerData.total,
        };

        const dataString = JSON.stringify(data, null, 2); // spacing level = 2

        const chunks = dataString.match(/[\s\S]{1,2000}/g) || [];

        for (const chunk of chunks) {
            // Send ready message to user 426330456753963008
            this.discordService.sendPrivateMessage('426330456753963008', chunk);
        }
    }

    /**
     * Get unique random legends for user to choose
     * @param amount amount of legends to get
     * @returns array of random legends
     */
    private getRandomLegends(amount: number): string[] {
        const legends = [...this.basicLegends];

        const randomLegends = [];

        for (let i = 0; i < amount; i++) {
            const randomIndex = Math.floor(Math.random() * legends.length);
            const randomLegend = legends[randomIndex];

            randomLegends.push(randomLegend);

            legends.splice(randomIndex, 1);
        }

        return randomLegends;
    }

    /**
     * Timeout that checks if user has chosen provided legend every 5 seconds
     * @param username username to check
     * @param platform platform to check
     * @param timeout timeout in ms
     * @returns true if user has chosen provided legend, false if not or if check timed out
     */
    private awaitLegendChoice(legendName: string, username: string, platform: any, timeout: number): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            let checkTimeout: any;

            const checkOnlineInterval = setInterval(async () => {
                const playerData = await this.apexApiService.getPlayerStatisticsByName(username, platform);
    
                console.log(`Checking if ${playerData.realtime?.selectedLegend} is ${legendName}`);

                if (typeof playerData?.errorCode == "undefined") {
                    const isLegendSelected = playerData.realtime?.selectedLegend == legendName;
                    
                    if (isLegendSelected) {
                        // User is online, send message with legend selection
                        clearTimeout(checkTimeout);
                        clearTimeout(checkOnlineInterval);
                        resolve(true);
                    }
                }
            }, 5000);
    
            checkTimeout = setTimeout(() => {
                clearInterval(checkOnlineInterval);
                resolve(false);
            }, timeout)
        });
    }

    /**
     * Timeout that checks if user is online every 5 seconds
     * @param username username to check
     * @param platform platform to check
     * @param timeout timeout in ms
     * @returns true if user is online, false if not or if check timed out
     */
    private awaitUserOnline(username: string, platform: any, timeout: number): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            let checkTimeout: any;

            const checkOnlineInterval = setInterval(async () => {

                const playerData = await this.apexApiService.getPlayerStatisticsByName(username, platform);
    
                if (typeof playerData?.errorCode == "undefined") {
                    const isOnline = playerData.realtime?.isOnline;
    
                    if (isOnline == 1) {
                        // User is online, send message with legend selection
                        clearTimeout(checkTimeout);
                        clearTimeout(checkOnlineInterval);
                        resolve(true);
                    }
                }
            }, 5000);
    
            checkTimeout = setTimeout(() => {
                console.log("Timeout!");
                clearInterval(checkOnlineInterval);
                resolve(false);
            }, timeout)
        });
    }

    /**
     * Get basic embed with logo and color
     * @returns basic embed with logo and color
     */
    private getBasicEmbed() {
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
    private getPlayerDataConfirmMessage(playerData: PlayerStatistics): InteractionReplyOptions {

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
                }
            )
            .setThumbnail(playerData.global.avatar)

            return {
                embeds: [embed],
                components: [row as any],
                ephemeral: true,
            }
    }

    private getAccountExistMessage(account: ApexAccountEntity, sameUser = false) {
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

    private getAlreadyConnectedMessage(account: ApexAccountEntity) {

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
    private getPlayerDataExpiredMessage() {
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
    private getConnectAccountMessage(legendName: string, online: boolean, expireTimestamp: number, legendImage = this.configService.get('images.logo-transparent'), progress): InteractionReplyOptions {
    
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
    private getExpirationMessage() {
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
    private getErrorEmbed(errorMessage) {
        const embed = this.getBasicEmbed()
            .setTitle('Wystąpił błąd')
            .setDescription('Przepraszamy, coś poszło nie tak. Spróbuj ponownie później lub skontaktuj się z administracją.')
            .setThumbnail(this.configService.get<string>('images.danger'));

        if (errorMessage) {
            embed.addFields({
                name: 'Treść Błędu',
                value: errorMessage,
            });
        }

        return {
            embeds: [embed],
            components: [],
        }
    }

    private getSuccessMessage(playerData: PlayerStatistics): InteractionReplyOptions {
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

}
