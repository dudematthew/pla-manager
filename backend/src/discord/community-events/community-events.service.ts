import { Injectable } from '@nestjs/common';
import { ActionRowBuilder, ApplicationCommand, ApplicationCommandSubCommand, Attachment, ButtonBuilder, ButtonStyle, CacheType, ChatInputCommandInteraction, ColorResolvable, EmbedBuilder, User } from 'discord.js';
import { handleCommunityEventCreateDiscordCommandDto } from '../commands/dtos/handle-community-events-create-discord-command';
import { CommunityEventService } from 'src/database/entities/community-event/community-event.service';
import DateInterpreter from 'src/misc/date-interpreter';
import { ConfigService } from '@nestjs/config';
import { DiscordService } from '../discord.service';
import { UserService } from 'src/database/entities/user/user.service';
import { RoleService } from 'src/database/entities/role/role.service';
import { ChannelService } from 'src/database/entities/channel/channel.service';

// Create type of event
class eventType {
    title: string;
    description: string;
    startDate?: Date;
    endDate?: Date;
    color?: `#${string}`;
    image?: Attachment;
    user: User;
}

@Injectable()
export class CommunityEventsService {

    constructor(
        private readonly communityEventService: CommunityEventService,
        private readonly configService: ConfigService,
        private readonly discordService: DiscordService,
        private readonly userService: UserService,
        private readonly roleService: RoleService,
        private readonly channelService: ChannelService,
    ) {}

    public async handleCommunityEventCreateDiscordCommand(interaction: ChatInputCommandInteraction<CacheType>, options: handleCommunityEventCreateDiscordCommandDto) {
        console.log('handleCommunityEventCreateDiscordCommand');

        await interaction.deferReply({ ephemeral: true });

        const dateInterpreter = new DateInterpreter();
        const startDate = options.startDate ? dateInterpreter.parse(options.startDate) : null;
        const endDate = options.endDate ? dateInterpreter.parse(options.endDate) : null;

        // Check if title is not too short
        if (options.title.length < 3) {
            await interaction.editReply({
                content: `## :x: Nazwa wydarzenia jest za krótka!`,
            });
            return;
        }
            
    
        // Check if startDate is not null
        if (!startDate && options.startDate) {
            console.info(`startDate: ${startDate}, options.startDate: ${options.startDate}`);
            await interaction.editReply({
                content: `## :x: Niepoprawna data rozpoczęcia!`,
            });
            return;
        }

        // Check if endDate is not null
        if (!endDate && options.endDate) {
            console.info(`endDate: ${endDate}, options.endDate: ${options.endDate}`);
            await interaction.editReply({
                content: `## :x: Niepoprawna data rozpoczęcia!`,
            });
            return;
        }

        // Check if startDate is not in the past
        if (options.startDate && !startDate && startDate.getTime() < Date.now()) {
            await interaction.editReply({
                content: `## :x: Data rozpoczęcia nie może być w przeszłości!`,
            });
            return;
        }

        // Check if endDate is not in the past
        if (options.endDate && !endDate && endDate.getTime() < Date.now()) {
            await interaction.editReply({
                content: `## :x: Data zakończenia nie może być w przeszłości!`,
            });
            return;
        }

        // Check if startDate is not after endDate
        if (options.startDate && options.endDate && !startDate && !endDate && startDate.getTime() > endDate.getTime()) {
            await interaction.editReply({
                content: `## :x: Data rozpoczęcia nie może być późniejsza niż data zakończenia!`,
            });
            return;
        }

        // Check if image is actually an image
        if (options.image && !options.image.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
            await interaction.editReply({
                content: `## :x: Niepoprawny format grafiki!`,
            });
            return;
        }

        const eventData: eventType = {
            title: options.title,
            description: options.description,
            startDate: startDate,
            endDate: endDate,
            color: options?.color,
            image: options?.image,
            user: interaction.user,
        }
        
        const eventEmbed = await this.getEventEmbed(eventData);

        const acceptButton = new ButtonBuilder()
            .setStyle(ButtonStyle.Success)
            .setLabel('Utwórz wydarzenie')
            .setCustomId('apex-event-create-accept')
            .setEmoji('✅');

        const cancelButton = new ButtonBuilder()
            .setStyle(ButtonStyle.Danger)
            .setLabel('Nie, zmień dane')
            .setCustomId('apex-event-create-cancel')
            .setEmoji('✖');

        const row = new ActionRowBuilder()
            .addComponents(acceptButton, cancelButton);

        await interaction.editReply({
            content: `Czy wszystko się zgadza?`,
            embeds: [eventEmbed],
            components: [row as any],
        });

        console.info(`Image URL: ${eventData.image?.url}`);

        const collectorFilter = i => i.user.id == interaction.user.id;
        
        let confirmation: any;
        
        try {
            confirmation = await interaction.channel.awaitMessageComponent({ filter: collectorFilter, time: 60000 });
        } catch (e) {
            await interaction.editReply(this.getExpiredMessage());
            return;
        }
        
        confirmation.deferUpdate();

        if (confirmation.customId == 'apex-event-create-cancel') {
            await interaction.editReply(await this.getCancelMessage());
            return;
        }

        // Get users user entity
        let user = await this.userService.findByDiscordId(interaction.user.id);

        // If user is not found, create one
        if (!user) {
            user = await this.userService.create({
                discordId: interaction.user.id,
            });
        }

        // Create event
        const communityEvent = await this.communityEventService.create({
            name: eventData.title,
            description: eventData.description,
            startDate: eventData.startDate ?? undefined,
            endDate: eventData.endDate ?? undefined,
            color: eventData.color ?? undefined,
            imageUrl: eventData.image?.url ?? undefined,
            approveState: 'pending',
        }, user);

        if (!communityEvent) {
            await interaction.editReply({
                content: `## :x: Wystąpił błąd podczas tworzenia wydarzenia!`,
            });
            return;
        }

        const reportsChannel = await this.channelService.findByName('reports');
        const communityEventsChannel = await this.channelService.findByName('communityevents');
        const approveMessage = await this.getApproveMessage(communityEvent.id, eventData);

        if (!reportsChannel || !communityEventsChannel) {
            await interaction.editReply({
                content: `## :x: Wystąpił błąd podczas tworzenia wydarzenia!`,
            });
            console.error('Reports channel or community events channel not found!');
            return;
        }

        await this.discordService.sendMessage(reportsChannel.discordId, approveMessage['content'], approveMessage['embeds'], approveMessage['components']);

        await interaction.editReply(await this.getSuccessMessage());
    }

    private async getEventEmbed(eventData: eventType) {
        const embed = this.getBaseEmbed();

        const startTimestamp = eventData.startDate ? `<t:${Math.floor(eventData.startDate.getTime() / 1000)}:F>` : null;
        const endTimestamp = eventData.endDate ? `<t:${Math.floor(eventData.endDate.getTime() / 1000)}:F>` : null;
        

        const description = [];

        description.push(`Wydarzenie użytkownika ${eventData.user}`);
        description.push(`# ${eventData.title}`);
        description.push(``);
        description.push(eventData.description);

        embed.setDescription(description.join('\n'));

        if (startTimestamp) {
            embed.addFields([
                {
                    name: 'Data rozpoczęcia',
                    value: startTimestamp,
                }
            ]);
        }

        if (endTimestamp) {
            embed.addFields([
                {
                    name: 'Data zakończenia',
                    value: endTimestamp,
                }
            ]);
        }

        if (eventData.image) {
            embed.setImage(eventData.image.url);
        }

        if (eventData.color) {
            embed.setColor(eventData.color);
        }

        return embed;
    }

    /**
     * Get message that admin can use to approve or reject event
     * @param eventId 
     * @param eventData 
     */
    private async getApproveMessage(eventId: number, eventData: eventType) {
        const eventCommand = await this.discordService.getApplicationCommand('wydarzenie') as ApplicationCommand;
        const adminRole = await this.roleService.findByName('admin');
        const moderatorRole = await this.roleService.findByName('moderator');
        
        const description = [];

        description.push(`Wydarzenie użytkownika ${eventData.user} oczekuje na zatwierdzenie.`);
        description.push(`Tytuł: \`${eventData.title}\``);
        description.push(``);
        description.push(`Opis: \`${eventData.description}\``);
        description.push(``);
        description.push(`Data rozpoczęcia: \`${eventData.startDate ? `<t:${Math.floor(eventData.startDate.getTime() / 1000)}:F>` : 'Nie podano'}\``);
        description.push(`Data zakończenia: \`${eventData.endDate ? `<t:${Math.floor(eventData.endDate.getTime() / 1000)}:F>` : 'Nie podano'}\``);
        description.push(``);
        description.push(`Kolor: \`${eventData.color ?? 'Nie podano'}\``);


        const embed = this.getBaseEmbed()
            .setTitle('Wydarzenie do zatwierdzenia')
            .setDescription(description.join('\n'))
            .setThumbnail(this.configService.get<string>('images.logo-transparent'))

        if (eventData.image?.url)
            embed.setImage(eventData.image?.url ?? undefined);

        const acceptButton = new ButtonBuilder()
            .setStyle(ButtonStyle.Success)
            .setLabel('Zatwierdź')
            .setCustomId(`community-event-approve:${eventId}`)
            .setEmoji('✅');

        const rejectButton = new ButtonBuilder()
            .setStyle(ButtonStyle.Danger)
            .setLabel('Odrzuć')
            .setCustomId(`community-event-reject:${eventId}`)
            .setEmoji('✖');

        const row = new ActionRowBuilder()
            .addComponents(acceptButton, rejectButton);

        return {
            content: `${moderatorRole} ${adminRole}`,
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
                name: 'Wydarzenie Społeczności',
                iconURL: this.configService.get<string>('images.event')
            })
            .setColor(this.configService.get<ColorResolvable>('embeds.color-primary'))
            .setTimestamp();
    }

    /**
     * Get message that informs user that player data confirmation has expired
     * @returns message that informs user that player data confirmation has expired
     */
    public getExpiredMessage() {
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

    public async getCancelMessage() {
        const eventCommand = await this.discordService.getApplicationCommand('wydarzenie') as ApplicationCommand;

        const embed = this.getBaseEmbed()
            .setTitle('Anulowano tworzenie wydarzenia')
            .setDescription(`Możesz spróbować ponownie używając komendy </${eventCommand.name} stwórz:${eventCommand.id}>`)
            .setThumbnail(this.configService.get<string>('images.logo-transparent'));

        return {
            content: '',
            embeds: [embed],
            components: [],
        }
    }

    public async getSuccessMessage() {
        const embed = this.getBaseEmbed()
            .setTitle('Wydarzenie przesłane do weryfikacji')
            .setDescription(`Wydarzenie zostało przesłane do weryfikacji. Po sprawdzeniu przez moderatora zostanie opublikowane.`)
            .setThumbnail(this.configService.get<string>('images.success'));

        return {
            content: '',
            embeds: [embed],
            components: [],
        }
    }

}
