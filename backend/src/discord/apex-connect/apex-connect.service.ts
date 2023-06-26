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
import { MessageProviderService } from './message-provider.service';
import { ApexSyncService } from './apex-sync.service';

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
        private readonly messageProviderService: MessageProviderService,
        private readonly apexSyncService: ApexSyncService,
    ) {}

    public async handleConnectCommand(interaction: ChatInputCommandInteraction<CacheType>, options: handleConnectCommandDto) {
        const playerData = await this.apexApiService.getPlayerStatisticsByName(options.username, options.platform);

        await interaction.deferReply({ ephemeral: true });

        console.log(`User ${interaction.user.username} requested to connect account ${options.username} on platform ${options.platform}. Got player data (global):`, playerData.global);

        this.logAccountData(playerData, interaction, options);

        if (typeof playerData?.errorCode !== "undefined") {
            if (playerData.errorCode == 404) {
                interaction.editReply({ content: `Nie znaleziono gracza o nicku ${options.username} na platformie ${platformAliases[options.platform]}.`});
                this.sendConnectionStatusToLogChannel(interaction, options, "unresolved");
            }
            
            else {
                interaction.editReply({ content: `Wystąpił błąd podczas próby znalezienia konta. Spróbuj ponownie później.`});
                this.sendConnectionStatusToLogChannel(interaction, options, "error");
            }
                
            return;
        }

        // Send message with player data and ask user to confirm
        const confirmResponse = await interaction.editReply(this.messageProviderService.getPlayerDataConfirmMessage(playerData));

        const collectorFilter = i => i.user.id == interaction.user.id;

        let confirmation: any;

        try {
            confirmation = await confirmResponse.awaitMessageComponent({ filter: collectorFilter, time: 60000 });
        } catch (e) {
            await interaction.editReply(this.messageProviderService.getPlayerDataExpiredMessage());
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

            const message = this.messageProviderService.getAccountExistMessage(checkForAccount, sameUser);

            interaction.editReply(message);
            
            if (sameUser)
                return;

            const collectorFilter = i => i.user.id == interaction.user.id;

            let confirmation: any;

            try {
                confirmation = await interaction.channel.awaitMessageComponent({ filter: collectorFilter, time: 60000 });
            }
            catch (e) {
                await interaction.editReply(this.messageProviderService.getPlayerDataExpiredMessage());
                return;
            }
        }

        // Account that is already connected to user
        const checkIfConnected = (await this.userService.findByDiscordId(interaction.user.id))?.apexAccount;

        // Check if user is already connected and it's not the same account
        if (checkIfConnected) {
            interaction.editReply(this.messageProviderService.getAlreadyConnectedMessage(checkIfConnected));

            const collectorFilter = i => i.user.id == interaction.user.id;

            let confirmation: any;

            try {
                confirmation = await interaction.channel.awaitMessageComponent({ filter: collectorFilter, time: 60000 });
            }
            catch (e) {
                await interaction.editReply(this.messageProviderService.getPlayerDataExpiredMessage());
                return;
            }
        }

        // Create timestamp for 60 seconds from now
        let expireTimestamp = Math.floor(Date.now() / 1000) + this.onlineExpirationTime;

        await interaction.editReply(this.messageProviderService.getConnectAccountMessage('', false, expireTimestamp, undefined, { current: 0, target: 3 }));

        // Check if bot is in development mode
        const isDevelopment = this.configService.get('NODE_ENV') == 'development';

        if (!isDevelopment) {
            const isOnline = await this.awaitUserOnline(options.username, options.platform, this.onlineExpirationTime * 1000);
            
            if (!isOnline) {
                await interaction.editReply(this.messageProviderService.getExpirationMessage());
                return;
            }
    
            const randomLegends = this.getRandomLegends(3);
    
            // Wait 3 times for user to choose legend
            for (let i = 0; i < 3; i++) {
                expireTimestamp = Math.floor(Date.now() / 1000) + this.legendChangeExpirationTime;
    
                const legendImage = playerData.legends.all[randomLegends[i]].ImgAssets.icon;
    
                await interaction.editReply(this.messageProviderService.getConnectAccountMessage(randomLegends[i], true, expireTimestamp, legendImage, { current: i + 1, target: 3 }));
    
                const isLegendSelected = await this.awaitLegendChoice(randomLegends[i], options.username, options.platform, this.legendChangeExpirationTime * 1000);
    
                if (!isLegendSelected) {
                    await interaction.editReply(this.messageProviderService.getExpirationMessage());
                    return;
                }
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
                await interaction.editReply(this.messageProviderService.getErrorMessage("Nie udało się utworzyć twojego konta."));
                this.sendConnectionStatusToLogChannel(interaction, options, "error");
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

        const newUser: UserEntity = await this.apexAccountService.saveAccount(playerData, user);

        // If newUser is null (something went wrong), abort
        if (!newUser || !newUser.apexAccount) {
            await interaction.editReply(this.messageProviderService.getErrorMessage("Nie udało się powiązać twojego konta."));
            this.sendConnectionStatusToLogChannel(interaction, options, "error");
            return;
        }

        // Update connected roles
        await this.apexSyncService.updateAllConnectedRolesForUser(newUser.id);

        // User has chosen legend, connect account
        await interaction.editReply(this.messageProviderService.getSuccessMessage(playerData));
        this.sendConnectionStatusToLogChannel(interaction, options, "success");
    }

    public async handlePrivateMessage(messageData: MessageData) {
        // console.log("Received private message: ", messageData);
    }

    /**
     * Send account data as a private message to developer
     * Limit to 2000 characters
     * @param playerData player data to send
     */
    private async logAccountData(playerData: PlayerStatistics, interaction?: ChatInputCommandInteraction<CacheType>, options?: handleConnectCommandDto) {
        const data = {
            username: playerData.global.name,
            realtime: playerData.realtime,
            total: playerData.total,
        };

        // Get admin id from env
        const adminId = process.env.DISCORD_MAIN_ADMIN_ID;

        // Check if object is empty
        if (Object.keys(data).length === 0 && data.constructor === Object) {
            this.discordService.sendPrivateMessage(adminId, `User ${interaction.user.username} requested to connect account ${options.username} on platform ${options.platform}. Got empty player data.`, );
        }

        const dataString = JSON.stringify(data, null, 2); // spacing level = 2

        const chunks = dataString.match(/[\s\S]{1,2000}/g) || [];

        for (const chunk of chunks) {
            // Send ready message to user 426330456753963008
            this.discordService.sendPrivateMessage(adminId, chunk);
        }
    }

    private async sendConnectionStatusToLogChannel(interaction: ChatInputCommandInteraction<CacheType>,apexAccount: handleConnectCommandDto,  status: string) {
        const logChannelId = process.env.DISCORD_LOG_CHANNEL_ID;
        const user = interaction.user;
        const accountName = apexAccount.username;
        const accountPlatform = apexAccount.platform;

        if (!logChannelId)
        return;

        console.log(`Sending connection status to channel: ${logChannelId}`);

        const embed = this.messageProviderService.getBasicEmbed();

        const color = status == "success" ? "#00ff00" : "#ff0000";
        let statusText = status;
        
        switch(status) {
            case "success":
                embed.setThumbnail(this.configService.get<string>('images.success')); 
                statusText = "Połączono";  
                break;
            case "unresolved":
                embed.setThumbnail(this.configService.get<string>('images.unresolved'));
                statusText = "Nie znaleziono konta";
                break;
            case "error":
                embed.setThumbnail(this.configService.get<string>('images.danger'));
                statusText = "Wystąpił błąd";
                break;
            default:
                embed.setThumbnail(this.configService.get<string>('images.logo-transparent'));
        }
            
        embed.setColor(color);
        embed.setTitle("Status połączenia konta");
        embed.setDescription(`Użytkownik <@${user.id}> próbował połączyć konto **${accountName}** na platformie **${platformAliases[accountPlatform]}**.`);

        embed.addFields({
            name: "Wynik operacji",
            value: `${statusText} (*${status}*)`,
        });

        this.discordService.sendMessage(logChannelId, null, [embed]);
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

    

    

    

    

    

}
