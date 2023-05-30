import { Injectable } from '@nestjs/common';
import { MessageData } from '../discord.listeners';
import { SlashCommandContext } from 'necord';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CacheType, ChatInputCommandInteraction, ColorResolvable, EmbedBuilder, InteractionReplyOptions } from 'discord.js';
import { handleConnectCommandDto, platformAliases } from '../commands/dtos/handle-connect.command.dto';
import { ApexApiService } from 'src/apex-api/apex-api.service';
import { Logger } from '@nestjs/common';
import { PlayerStatisticsParamsDto } from 'src/apex-api/dtos/player-statistics-params.dto';
import { PlayerStatistics } from 'src/apex-api/player-statistics.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApexConnectService {

    private logger = new Logger(ApexConnectService.name);

    constructor(
        private readonly apexApiService: ApexApiService,
        private readonly configService: ConfigService,
    ) {}

    public async handleConnectCommand(interaction: ChatInputCommandInteraction<CacheType>, options: handleConnectCommandDto) {
        const playerData = await this.apexApiService.getPlayerStatisticsByName(options.username, options.platform);

        if (playerData?.errorCode === 404) {
            interaction.reply({ content: `Nie znaleziono gracza o nicku ${options.username} na platformie ${platformAliases[options.platform]}.`, ephemeral: true});
            return;
        }

        const cofirmResponse = await interaction.reply(this.getPlayerDataConfirmMessage(playerData));

        const collectorFilter = i => i.user.id == interaction.user.id;

        let confirmation: any;

        try {
            confirmation = await cofirmResponse.awaitMessageComponent({ filter: collectorFilter, time: 60000 });
        } catch (e) {
            await interaction.editReply(this.getPlayerDataExpiredMessage());
            return;
        }

        if (confirmation.customId !== 'apex-connect-confirm') {
            this.logger.error(`Confirmation customId is not apex-connect-confirm. Received: ${confirmation.customId}`);
            return;
        }

        await interaction.editReply(this.getConnectAccountMessage('Bangalore', false, 0));
        

        // interaction.reply({ content: `Hej! Widzę że próbujesz połączyć swoje konto ${options.username}! Zanim to się jednak stanie musisz potwierdzić, że konto należy do ciebie. Wysłałem ci prywatną wiadomość, w ramach procesu zaklepania twojego konta Apex.`, ephemeral: true});

        // interaction.user.send({ content: `Hej! Widzę że próbujesz połączyć swoje konto ${options.username}! Zanim to się jednak stanie musisz potwierdzić, że konto należy do ciebie. W tym celu musisz wysłać wiadomość na czacie w grze, zawierającą kod: ${options.code}. Po wysłaniu wiadomości, napisz mi na czacie prywatnym komendę \`/connect ${options.code}\` aby potwierdzić swoją tożsamość.`});
    }

    public async handlePrivateMessage(messageData: MessageData) {
        console.log("Received private message: ", messageData);
    }

    private getBasicEmbed() {
        return new EmbedBuilder()
            .setAuthor({
                name: 'Polskie Legendy Apex',
                iconURL: this.configService.get<string>('images.logo-transparent')
            })
            .setColor(this.configService.get<ColorResolvable>('embeds.color-primary'))
            .setTimestamp();
    }

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
            }
    }

    private getPlayerDataExpiredMessage() {
        const embed = this.getBasicEmbed()
            .setTitle('Nie potwierdzono wyboru.')
            .setDescription('Nie potwierdzono wyboru w ciągu 60 sekund. Spróbuj ponownie.')
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
    private getConnectAccountMessage(legendName: string, online: boolean, expireTimestamp: number): InteractionReplyOptions {
    
        const embed = this.getBasicEmbed();

        if (!online) {
            embed.setTitle('Zaloguj się do gry')
            embed.setDescription('Aby połączyć konto, musisz być zalogowany do gry.');

            return {
                embeds: [embed],
                components: [],
            }
        }


        return {
            embeds: [embed],
            components: [],
        }
    }

}
