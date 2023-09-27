import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CacheType, ChatInputCommandInteraction, ColorResolvable, EmbedBuilder } from 'discord.js';
import { handleGivewayJoinCommandDto } from '../commands/dtos/handle-giveaway-join-command.dto.ts';
import { UserService } from 'src/database/entities/user/user.service';
import { GiveawayMemberService } from 'src/database/entities/giveaway-member/giveaway-member.service';
import { ConfigService } from '@nestjs/config';
import { ChannelService } from 'src/database/entities/channel/channel.service';
import { TwitchApiService } from './twitch-api.service.js';

@Injectable()
export class GiveawayService {

    private logger = new Logger('GiveawayService');

    private readonly giveawayEndTimestamp = 1696179600;
    private readonly giveawayEndDate = new Date(this.giveawayEndTimestamp * 1000);

    constructor(
        private readonly userService: UserService,
        private readonly giveawayMemberService: GiveawayMemberService,
        private readonly configService: ConfigService,
        private readonly channelService: ChannelService,
        private readonly twitchApiService: TwitchApiService,
    ) {}

    public async handleGiveawayJoinDiscordCommand(interaction: ChatInputCommandInteraction<CacheType>, options: handleGivewayJoinCommandDto) {
        console.log('handleGiveawayJoinDiscordCommand');

        await interaction.reply({
            content: `## :hourglass_flowing_sand: Przetwarzanie...`,
            ephemeral: true,
        });

        // Check if giveaway has ended
        if (new Date() > this.giveawayEndDate) {
            interaction.editReply({
                content: '## :x: Konkurs już się zakończył. Zapraszamy następnym razem!',
            });

            return;
        }

        let dbUser = await this.userService.findByDiscordId(interaction.user.id);

        // If user doesn't exists create new one
        if (!dbUser) {
            dbUser = await this.userService.create({
                discordId: interaction.user.id,
            });

            if (!dbUser) {
                interaction.editReply({
                    content: '## :x: Wystąpił błąd podczas dołączania do konkursu. Spróbuj ponownie później.',
                })

                throw new InternalServerErrorException('handleGiveawayJoinDiscordCommand: Failed to create user');
            }
        }

        const giveawayMember = await this.giveawayMemberService.findOneByDiscordId(interaction.user.id);

        if (giveawayMember) {
            interaction.editReply({
                content: '## :x: Już dołączyłeś do konkursu! Jeśli chcesz się wypisać, wpisz komendę */konkurs wypisz*',
            });

            return;
        }

        console.log('dbUser', dbUser);

        const checkForExistingMember = await this.giveawayMemberService.findOneByTwichNick(options.twitchNick);

        if (checkForExistingMember) {
            interaction.editReply({
                content: '## :x: Użytkownik o podanym nicku Twitch już dołączył do konkursu. Jeśli Twoim zdaniem zaszła pomyłka, skontaktuj się z administracją.',
            });

            return;
        }

        const connectChannel = await this.channelService.findByName('synchronization');

        const explainMessage = await this.getExplainMessage(options.twitchNick);

        await interaction.editReply(explainMessage);

        const collectorFilter = i => i.user.id == interaction.user.id;
        
        let confirmation: any;
        
        try {
            confirmation = await interaction.channel.awaitMessageComponent({ filter: collectorFilter, time: 60000 });
        } catch (e) {
            await interaction.editReply(this.getExpiredMessage());
            return;
        }
        
        confirmation.deferUpdate();

        if (confirmation.customId == 'giveaway-cancel') {

            interaction.editReply({
                content: `### :raised_hand: Jasne, poczekamy na Ciebie! Wróć gdy zostawisz follow [snakebitebettyx](https://www.twitch.tv/snakebitebettyx), a także połączysz konto Apex za pomocą instrukcji na ${connectChannel}`,
                embeds: [],
                components: [],
            });

            return;
        }

        await interaction.editReply({
            content: `## :hourglass_flowing_sand: Przetwarzanie...`,
            embeds: [],
            components: [],
        });

        const twitchUserData = await this.twitchApiService.getFollowed(options.twitchNick);

        if (twitchUserData && !twitchUserData.id) {
            interaction.editReply({
                content: '## :x: Nie możesz dołączyć do konkursu, ponieważ podane konto Twitch nie istnieje.',
            });

            return;
        }

        if (twitchUserData && !twitchUserData.following) {
            interaction.editReply({
                content: '## :x: Nie możesz dołączyć do konkursu, ponieważ nie obserwujesz kanału [snakebitebettyx](https://www.twitch.tv/snakebitebettyx) na Twitchu.',
            });

            return;
        } else if (!twitchUserData) {
            interaction.editReply({
                content: '## :x: Wystąpił błąd podczas dołączania do konkursu. Spróbuj ponownie później.',
            });

            return;
        }
        
        // Check if user has connected role 
        if (!dbUser.apexAccount) {
            interaction.editReply({
                content: `### :x: Nie możesz dołączyć do konkursu, ponieważ nie połączyłeś swojego konta Apex Legends. Możesz to zrobić korzystając z instrukcji na ${connectChannel}`,
            });

            return;
        }

        const member = await this.giveawayMemberService.create({
            user: dbUser,
            twitchNick: options.twitchNick,
            twitchId: twitchUserData.id,
        });

        if (!member) {
            interaction.editReply({
                content: '## :x: Wystąpił błąd podczas dołączania do konkursu. Spróbuj ponownie później.',
            });

            return;
        }

        interaction.editReply(this.getSuccessMessage());
    }

    private async getExplainMessage (twitchNick: string) {

        const connectChannel = await this.channelService.findByName('synchronization')

        const embed = this.getBaseEmbed();

        embed.setTitle('Warunki dołączenia do konkursu');
        
        const description = [];

        description.push('## Witamy w konkursie Polskich Legend Apex & SnakeBiteBetty!');
        description.push('W tym konkursie znajdziesz się w puli graczy, którzy będą losowani do wygranej. Jeśli wygrasz, Betty zakupi dla ciebie dowolne elementy dostępne aktualnie w sklepie Apex Legends o wartości do **2500** Monet Apex!');
        description.push('');
        description.push('## Aby dołączyć do konkursu, musisz spełnić następujące warunki:');
        description.push('1. Musisz obserwować kanał [snakebitebettyx](https://www.twitch.tv/snakebitebettyx) na Twitchu. Jeśli podane konto Twitch nie należy do Ciebie, nie otrzymasz nagrody.');
        description.push(`2. Musisz mieć połączone konto Apex Legends - Możesz to zrobić na kanale ${connectChannel} wpisując komendę */połącz*`);
        description.push('');
        description.push('### Po spełnieniu warunków, kliknij przycisk poniżej aby dołączyć do konkursu!');
        description.push('Życzymy powodzenia!');

        embed.setDescription(description.join('\n'));

        embed.setImage(this.configService.get<string>('images.giveaways.snakebitebetty'));

        embed.addFields([
            {
                name: 'Losowanie zakończy się',
                value: `<t:${this.giveawayEndTimestamp}:F>`,
            },
        ])

        const acceptButton = new ButtonBuilder()
            .setStyle(ButtonStyle.Success)
            .setLabel('Zapisuję się!')
            .setCustomId('giveaway-join')
            .setEmoji('✅');

        const cancelButton = new ButtonBuilder()
            .setStyle(ButtonStyle.Secondary)
            .setLabel('Zaraz wrócę!')
            .setCustomId('giveaway-cancel')
            .setEmoji('✋');

        const row = new ActionRowBuilder()
            .addComponents(acceptButton, cancelButton);

        return {
            content: ``,
            embeds: [embed],
            components: [row as any],
        }
    }

    private getBaseEmbed() {
        return new EmbedBuilder()
            .setFooter({
                text: 'Polskie Legendy Apex',
                iconURL: this.configService.get<string>('images.logo-transparent')
            })
            .setAuthor({
                name: 'Konkurs Polskich Legend Apex & SnakeBiteBetty',
                iconURL: this.configService.get<string>('images.logo-transparent')
            })
            .setColor(this.configService.get<ColorResolvable>('embeds.color-primary'))
            .setTimestamp();
    }

    private getSuccessMessage() {
        const embed = this.getBaseEmbed()
            .setTitle('Dołączono do konkursu ')
            .setDescription('### :tada: Gratulacje! Dołączyłeś do konkursu! Jeśli wygrasz, Betty zakupi dla ciebie dowolne elementy dostępne aktualnie w sklepie Apex Legends o wartości do **2500** Monet Apex!\nPolskie Legendy Apex życzą powodzenia!')

        embed.addFields([
            {
                name: 'Losowanie zakończy się',
                value: `<t:${this.giveawayEndTimestamp}:R>`,
            },
            {
                name: 'W międzyczasie możesz korzystać z',
                value: `naszego serwera aby znaleźć graczy do gry!`,
            }
        ])

        embed.setImage(this.configService.get<string>('images.celebration'));

        return {
            content: ``,
            embeds: [embed],
            components: [],
        }
    }

    /**
     * Get message that informs user that player data confirmation has expired
     * @returns message that informs user that player data confirmation has expired
     */
    private getExpiredMessage() {
        const embed = this.getBaseEmbed()
            .setTitle('Nie potwierdzono wyboru')
            .setDescription('Nie potwierdzono wyboru w wyznaczonym czasie. Spróbuj ponownie.')
            .setThumbnail(this.configService.get<string>('images.logo-transparent'));

        return {
            content: ``,
            embeds: [embed],
            components: [],
        }
    }
}
