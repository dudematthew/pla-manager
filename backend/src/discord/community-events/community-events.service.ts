import { Injectable } from '@nestjs/common';
import { ActionRowBuilder, ApplicationCommand, ApplicationCommandSubCommand, Attachment, ButtonBuilder, ButtonStyle, CacheType, ChatInputCommandInteraction, ColorResolvable, EmbedBuilder, GuildMember, ModalActionRowComponent, ModalActionRowComponentBuilder, ModalBuilder, ModalSubmitInteraction, TextInputBuilder, TextInputStyle, User } from 'discord.js';
import { handleCommunityEventCreateDiscordCommandDto } from '../commands/dtos/handle-community-events-create-discord-command';
import { CommunityEventService } from 'src/database/entities/community-event/community-event.service';
import DateInterpreter from 'src/misc/date-interpreter';
import { ConfigService } from '@nestjs/config';
import { DiscordService } from '../discord.service';
import { UserService } from 'src/database/entities/user/user.service';
import { RoleService } from 'src/database/entities/role/role.service';
import { ChannelService } from 'src/database/entities/channel/channel.service';
import { ButtonData } from '../discord.listeners';
import { CommunityEventEntity } from 'src/database/entities/community-event/entities/community-event.entity';

// Create type of event
class EventType {
    title: string;
    description: string;
    user: GuildMember;
    approveState?: "pending" | "approved" | "rejected";
    rejectReason?: string;
    rejectedBy?: GuildMember;
    startDate?: Date;
    endDate?: Date;
    color?: `#${string}`;
    imageUrl?: string;
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

        // Check if endDate exists when startDate doesn't
        if (!startDate && endDate) {
            await interaction.editReply({
                content: `## :x: Data zakończenia nie może być podana bez daty rozpoczęcia!`,
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

        const eventData: EventType = {
            title: options.title,
            description: options.description,
            startDate: startDate,
            endDate: endDate,
            approveState: 'pending',
            user: interaction.member as GuildMember,
            color: options?.color,
            imageUrl: options?.image?.url,
        }
        
        const eventEmbed = await this.getEventEmbed(eventData);

        const acceptButton = new ButtonBuilder()
            .setStyle(ButtonStyle.Success)
            .setLabel('Utwórz wydarzenie')
            .setCustomId('community-event-create-accept')
            .setEmoji('✅');

        const cancelButton = new ButtonBuilder()
            .setStyle(ButtonStyle.Danger)
            .setLabel('Nie, zmień dane')
            .setCustomId('community-event-create-cancel')
            .setEmoji('✖');

        const row = new ActionRowBuilder()
            .addComponents(acceptButton, cancelButton);

        await interaction.editReply({
            content: `### Czy wszystko się zgadza?`,
            embeds: [eventEmbed],
            components: [row as any],
        });

        console.info(`Image URL: ${eventData.imageUrl}`);

        const collectorFilter = i => i.user.id == interaction.user.id;
        
        let confirmation: any;
        
        try {
            confirmation = await interaction.channel.awaitMessageComponent({ filter: collectorFilter, time: 60000 });
        } catch (e) {
            await interaction.editReply(this.getExpiredMessage());
            return;
        }
        
        confirmation.deferUpdate();

        if (confirmation.customId == 'community-event-create-cancel') {
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
        let communityEvent: CommunityEventEntity;
        try {
            communityEvent = await this.communityEventService.create({
                name: eventData.title,
                description: eventData.description,
                startDate: eventData.startDate ?? null,
                endDate: eventData.endDate ?? null,
                color: eventData.color ?? undefined,
                imageUrl: eventData.imageUrl?? undefined,
                approveState: 'pending',
            }, user);
        } catch (e) {
            await interaction.editReply({
                content: `## :x: Wystąpił błąd podczas tworzenia wydarzenia!\nSpróbuj ponownie, jednak nie używaj emoji jeśli są zawarte w tytule lub opisie wydarzenia. Jeśli to pomoże koniecznie daj znać administracji. Jeśli nie, spróbuj ponownie później.`,
                embeds: [],
                components: [],
            });
            console.error(e);
            return;
        }

        if (!communityEvent) {
            await interaction.editReply({
                content: `## :x: Wystąpił błąd podczas tworzenia wydarzenia!`,
                embeds: [],
                components: [],
            });
            return;
        }

        const reportsChannel = await this.channelService.findByName('reports');
        const communityEventsChannel = await this.channelService.findByName('communityevents');
        const approveMessage = await this.getApproveMessage(communityEvent.id, eventData);

        if (!reportsChannel || !communityEventsChannel) {
            await interaction.editReply({
                content: `## :x: Wystąpił błąd podczas tworzenia wydarzenia!`,
                embeds: [],
                components: [],
            });
            console.error('Reports channel or community events channel not found!');
            return;
        }

        await this.discordService.sendMessage(reportsChannel.discordId, approveMessage['content'], approveMessage['embeds'], approveMessage['components']);

        await interaction.editReply(await this.getSuccessMessage());
    }

    public async handleCommunityEventAcceptButton(buttonData: ButtonData) {
        console.log('handleCommunityEventAcceptButton');

        buttonData.interaction.deferUpdate();

        const eventId = parseInt(buttonData.id.split(':')[1]);
        const communityEvent = await this.communityEventService.findById(eventId);

        if (!communityEvent) {
            this.discordService.sendPrivateMessage(buttonData.user.id, `### :x: Wystąpił błąd podczas zatwierdzania wydarzenia\nWydarzenie nie zostało znalezione w bazie danych!`);
            return;
        }

        await this.communityEventService.update(eventId, {
            ...communityEvent,
            approveState: 'approved',
            color: communityEvent.color as `#${string}`,
        });

        const eventData: EventType = {
            title: communityEvent.name,
            description: communityEvent.description,
            startDate: communityEvent.startDate,
            endDate: communityEvent.endDate,
            user: buttonData.user,
            approveState: 'approved',
            imageUrl: communityEvent.imageUrl ?? undefined,
            color: communityEvent.color as `#${string}`,
        };

        const eventEmbed = await this.getEventEmbed(eventData);

        const approveMessage = await this.getApproveMessage(eventId, eventData);

        buttonData.message.edit(approveMessage);

        const communityEventsChannel = await this.channelService.findByName('communityevents');

        if (!communityEventsChannel) {
            console.error('Community events channel not found!');
            this.discordService.sendPrivateMessage(buttonData.user.id, `### :x: Wystąpił błąd podczas zatwierdzania wydarzenia\nNie znaleziono kanału wydarzeń społeczności!`);
            return;
        }

        let components = [];

        if (eventData.startDate) {
            const remindButton = new ButtonBuilder()
                .setStyle(ButtonStyle.Primary)
                .setLabel('Powiadom o rozpoczęciu')
                .setCustomId(`community-event-remind:${communityEvent.id}`)
                .setEmoji('🔔');
                
            components.push(new ActionRowBuilder()
                .addComponents(remindButton) as any);
        }

        eventEmbed.setFooter({
            text: `Polskie Legendy Apex • Chcesz utworzyć własne wydarzenie? Użyj komendy /wydarzenie stwórz`,
            iconURL: this.configService.get<string>('images.logo-transparent')
        });

        const communityEventsRole = await this.roleService.findByName('communityevents');

        await this.discordService.sendMessage(communityEventsChannel.discordId, `${communityEventsRole}`, [eventEmbed], components);

        await this.discordService.sendPrivateMessage(buttonData.user.id, `### :white_check_mark: Wydarzenie zostało zatwierdzone!`);
    }

    public async handleCommunityEventRejectButton(buttonData: ButtonData) {
        console.log('handleCommunityEventRejectButton');

        const eventId = parseInt(buttonData.id.split(':')[1]);
        const communityEvent = await this.communityEventService.findById(eventId);

        if (!communityEvent) {
            this.discordService.sendPrivateMessage(buttonData.user.id, `### :x: Wystąpił błąd podczas odrzucania wydarzenia\nWydarzenie nie zostało znalezione w bazie danych!`);
            return;
        }

        const modal = new ModalBuilder()
            .setTitle('Odrzucanie wydarzenia')
            .setCustomId('community-event-reject-reason')

        const reasonInput = new TextInputBuilder()
            .setCustomId('community-event-reject-reason')
            .setPlaceholder('Podaj powód odrzucenia wydarzenia')
            .setMinLength(3)
            .setStyle(TextInputStyle.Paragraph)
            .setLabel('Zostanie on wysłany do autora wydarzenia.')
            .setRequired(true);

        const actionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>()
            .addComponents(reasonInput);

        modal.addComponents(actionRow);

        await buttonData.interaction.showModal(modal);

        const collectorFilter = i => i.user.id == buttonData.user.id;

        let communityEventRejectReason: ModalSubmitInteraction<CacheType>;

        try {
            communityEventRejectReason = await buttonData.interaction.awaitModalSubmit({ filter: collectorFilter, time: 60000 });
        } catch (e) {
            communityEventRejectReason.deferUpdate();
            this.discordService.sendPrivateMessage(buttonData.user.id, `### :x: Nie podano powodu odrzucenia wydarzenia w wyznaczonym czasie!`);
            return;
        }

        communityEventRejectReason.deferUpdate();

        console.info(communityEventRejectReason.fields, communityEventRejectReason.fields.fields['community-event-reject-reason']);
        console.log(typeof communityEventRejectReason.fields) 
        const reason = communityEventRejectReason.fields.getTextInputValue('community-event-reject-reason');

        await this.communityEventService.update(eventId, {
            ...communityEvent,
            approveState: 'rejected',
            color: communityEvent.color as `#${string}`,
        });

        const author = await this.discordService.getMemberById(communityEvent.user.discordId);

        const eventData: EventType = {
            title: communityEvent.name,
            description: communityEvent.description,
            startDate: communityEvent.startDate,
            endDate: communityEvent.endDate,
            user: author,
            rejectedBy: buttonData.user,
            approveState: 'rejected',
            imageUrl: communityEvent.imageUrl ?? undefined,
            color: communityEvent.color as `#${string}`,
            rejectReason: reason,
        };

        const approveMessage = await this.getApproveMessage(eventId, eventData);


        buttonData.message.edit(approveMessage);

        this.discordService.sendPrivateMessage(buttonData.user.id, `### :white_check_mark: Wydarzenie zostało odrzucone!`);

        this.discordService.sendPrivateMessage(communityEvent.user.discordId, `## :x: Przepraszamy ale Twoje wydarzenie o tytule **${communityEvent.name}** zostało odrzucone!\n**Powód:** *${reason}*\nMamy nadzieję, że twoje następne wydarzenie zostanie zatwierdzone!`);
        
    }

    private async getEventEmbed(eventData: EventType) {
        const embed = this.getBaseEmbed();

        const startTimestamp = eventData.startDate ? `<t:${Math.floor(eventData.startDate.getTime() / 1000)}:F>` : null;
        const endTimestamp = eventData.endDate ? `<t:${Math.floor(eventData.endDate.getTime() / 1000)}:F>` : null;
        

        const description = [];

        description.push(`${eventData.user} zaprasza na swoje wydarzenie!`);
        description.push(`## ${eventData.title}`);
        description.push(``);
        description.push(eventData.description);

        embed.setDescription(description.join('\n'));
        embed.setThumbnail(eventData.user.displayAvatarURL() ?? eventData.user.user.displayAvatarURL());

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

        if (eventData?.imageUrl) {
            embed.setImage(eventData.imageUrl);
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
    private async getApproveMessage(eventId: number, eventData: EventType) {
        const adminRole = await this.roleService.findByName('admin');
        const moderatorRole = await this.roleService.findByName('moderator');
        
        let approveStateText = '';
        switch (eventData.approveState) {
            case 'approved':
                approveStateText = 'Zatwierdzone :white_check_mark:';
                break;
            case 'rejected':
                approveStateText = `Odrzucone :x:\n**Powód:** *${eventData?.rejectReason ?? `brak`}*\n**Odrzucone przez:** ${eventData?.rejectedBy}`;
                break;
            case 'pending':
                approveStateText = 'Oczekuje na zatwierdzenie :hourglass_flowing_sand:\n*Czy tytuł i opis są wystarczająco informatywne? Czy dane mają sens? Czy treści nie są niepoprawne?*';
        }
        
        const description = [];

        description.push(`Wydarzenie nr. **${eventId}** użytkownika ${eventData.user}.`);
        description.push(``);
        description.push(`**Tytuł:** \`${eventData.title}\``);
        description.push(``);
        description.push(`**Opis:** \`${eventData.description}\``);
        description.push(``);
        description.push(`**Data rozpoczęcia:** ${eventData.startDate ? `<t:${Math.floor(eventData.startDate.getTime() / 1000)}:F>` : '\`Nie podano\`'}`);
        description.push(`**Data zakończenia:** ${eventData.endDate ? `<t:${Math.floor(eventData.endDate.getTime() / 1000)}:F>` : '\`Nie podano\`'}`);
        description.push(``);
        description.push(`**Kolor:** \`${eventData.color ?? 'Nie podano'}\``);
        description.push(``);
        description.push(`**Grafika:** ${eventData?.imageUrl ? `[Kliknij tutaj](${eventData?.imageUrl})` : '\`Nie podano\`'}`);
        description.push(``);
        description.push(`### Status: ${approveStateText}`);


        const embed = this.getBaseEmbed()
            .setTitle('Wydarzenie do zatwierdzenia')
            .setDescription(description.join('\n'))
            .setThumbnail(this.configService.get<string>('images.logo-transparent'))
            
        if (eventData?.imageUrl)
            embed.setImage(eventData?.imageUrl ?? undefined);

        const components = [];

        if (eventData.approveState == 'pending') {
    
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

            components.push(row as any);
        } 
        else if (eventData.approveState == 'approved') {
            // If event has start date allow canceling it
            if (eventData.startDate && eventData.startDate.getTime() > Date.now()) {
                const cancelButton = new ButtonBuilder()
                    .setStyle(ButtonStyle.Secondary)
                    .setLabel('Anuluj Powiadomienie')
                    .setCustomId(`community-event-cancel:${eventId}`)
                    .setEmoji('❌');
        
                const row = new ActionRowBuilder()
                    .addComponents(cancelButton);
    
                components.push(row as any);
            }
        }
        else if (eventData.approveState == 'rejected') {
            const acceptButton = new ButtonBuilder()
                .setStyle(ButtonStyle.Success)
                .setLabel('Jednak zatwierdź')
                .setCustomId(`community-event-approve:${eventId}`)
                .setEmoji('✅');
            
            const row = new ActionRowBuilder()
                .addComponents(acceptButton);

            components.push(row as any);
        }
        
        const content = (eventData.approveState == 'pending') ? `${moderatorRole} ${adminRole}` : ``;

        return {
            content,
            embeds: [embed],
            components,
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
        const communityEventsChannel = await this.channelService.findByName('communityevents');

        const embed = this.getBaseEmbed()
            .setTitle('Wydarzenie przesłane do weryfikacji')
            .setDescription(`Po sprawdzeniu przez moderację zostanie opublikowane na kanale ${communityEventsChannel}.`)
            .setThumbnail(this.configService.get<string>('images.success'));

        return {
            content: '',
            embeds: [embed],
            components: [],
        }
    }

}
