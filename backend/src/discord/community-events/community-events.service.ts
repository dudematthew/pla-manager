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
import { CronService } from 'src/cron/cron.service';

// Create type of event
class EventType {
    title: string;
    description: string;
    user: GuildMember;
    approveState?: "pending" | "approved" | "rejected";
    rejectReason?: string;
    decisionBy?: GuildMember;
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
        private readonly cronService: CronService,
    ) {
        this.init();
    }

    private async init() {
        await this.discordService.isReady();

        // Schedule all events on start of the bot
        const communityEvents = await this.communityEventService.getAllWithReminders();

        communityEvents.forEach(communityEvent => {
            if (!communityEvent.startDate) {
                console.error(`Event with id ${communityEvent.id} doesn't have start date!`);
                return;
            }

            console.log(`Scheduling cron job for event ${communityEvent.id} at ${communityEvent.startDate}`)
            this.cronService.scheduleCronJob(`community-event-reminder-${communityEvent.id}`, communityEvent.startDate, () => {
                console.info(`Running cron job for community event ${communityEvent.id}`);
                this.remindUsersAboutEvent(communityEvent.id);
            });
        });
    }

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
            // console.info(`startDate: ${startDate}, options.startDate: ${options.startDate}`);
            await interaction.editReply({
                content: `## :x: Niepoprawna data rozpoczęcia!`,
            });
            return;
        }

        // Check if endDate is not null
        if (!endDate && options.endDate) {
            // console.info(`endDate: ${endDate}, options.endDate: ${options.endDate}`);
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

        const collectorFilter = i => i.user.id == interaction.user.id;
        
        let confirmation: any;
        
        try {
            confirmation = await interaction.channel.awaitMessageComponent({ filter: collectorFilter, time: 60000 });
        } catch (e) {
            await interaction.editReply(this.getExpiredMessage());
            return;
        }
        
        confirmation.deferUpdate();

        await interaction.editReply({
            components: [],
            embeds: [
                this.getBaseEmbed()
                    .setTitle(`:hourglass_flowing_sand: Przetwarzanie...`)
                    .setDescription(`### Proszę czekać, trwa przetwarzanie wydarzenia...`)
                    .setThumbnail(this.configService.get<string>('images.loading'))
            ]
        })

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

        buttonData.interaction.reply({
            content: `### :hourglass_flowing_sand: Przetwarzanie...`,
            ephemeral: true,
        });

        const eventId = parseInt(buttonData.id.split(':')[1]);
        const communityEvent = await this.communityEventService.findById(eventId);

        if (!communityEvent) {
            // this.discordService.sendPrivateMessage(buttonData.user.id, `### :x: Wystąpił błąd podczas zatwierdzania wydarzenia\nWydarzenie nie zostało znalezione w bazie danych!`);
            buttonData.interaction.editReply({
                content: `### :x: Wystąpił błąd podczas zatwierdzania wydarzenia\nWydarzenie nie zostało znalezione w bazie danych!`,
            });
            return;
        }

        // Check if event is not already rejected
        const isReaccepted = communityEvent.approveState == 'rejected';

        await this.communityEventService.update(eventId, {
            ...communityEvent,
            approveState: 'approved',
            color: communityEvent.color as `#${string}`,
            reminder: communityEvent.startDate ? true : false,
        });

        const author = await this.discordService.getMemberById(communityEvent.user.discordId);

        if(!author) {
            // this.discordService.sendPrivateMessage(buttonData.user.id, `### :x: Wystąpił błąd podczas zatwierdzania wydarzenia\nNie znaleziono autora wydarzenia!`);
            buttonData.interaction.editReply({
                content: `### :x: Wystąpił błąd podczas zatwierdzania wydarzenia\nNie znaleziono autora wydarzenia!`,
            });
            return;
        }

        const eventData: EventType = {
            title: communityEvent.name,
            description: communityEvent.description,
            startDate: communityEvent.startDate,
            endDate: communityEvent.endDate,
            user: author,
            approveState: 'approved',
            decisionBy: buttonData.user,
            imageUrl: communityEvent.imageUrl ?? undefined,
            color: communityEvent.color as `#${string}`,
        };

        const eventEmbed = await this.getEventEmbed(eventData);

        const approveMessage = await this.getApproveMessage(eventId, eventData);

        buttonData.message.edit(approveMessage);

        const communityEventsChannel = await this.channelService.findByName('communityevents');

        if (!communityEventsChannel) {
            console.error('Community events channel not found!');
            // this.discordService.sendPrivateMessage(buttonData.user.id, `### :x: Wystąpił błąd podczas zatwierdzania wydarzenia\nNie znaleziono kanału wydarzeń społeczności!`);
            buttonData.interaction.editReply({
                content: `### :x: Wystąpił błąd podczas zatwierdzania wydarzenia\nNie znaleziono kanału wydarzeń społeczności!`,
            });
            return;
        }

        let components = [];

        if (eventData.startDate && eventData.startDate.getTime() > Date.now()) {
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

        const communityEventMessage = await this.discordService.sendMessage(communityEventsChannel.discordId, `${communityEventsRole}`, [eventEmbed], components);


        // Create cron expression based on event start date
        this.cronService.scheduleCronJob(`community-event-reminder-${communityEvent.id}`, communityEvent.startDate, () => {
            console.info(`Running cron job for community event ${communityEvent.id}`);
            this.remindUsersAboutEvent(communityEvent.id);
        });

        // this.discordService.sendPrivateMessage(buttonData.user.id, `### :white_check_mark: Wydarzenie zostało zatwierdzone!`);
        buttonData.interaction.editReply({
            content: `### :white_check_mark: Wydarzenie zostało zatwierdzone!`,
        });

        if (!isReaccepted)
            this.discordService.sendPrivateMessage(communityEvent.user.discordId, `## :white_check_mark: Twoje wydarzenie o tytule *${communityEvent.name}* zostało zatwierdzone!\nMożesz je znaleźć tutaj: ${communityEventMessage.url}. Pamiętaj aby się pojawić i nie zawieść swoich fanów!`);
        else
            this.discordService.sendPrivateMessage(communityEvent.user.discordId, `## :white_check_mark: Po dokładniejszej analizie twoje wydarzenie o tytule *${communityEvent.name}* zostało jednak zatwierdzone przez moderację!\nMożesz je znaleźć tutaj: ${communityEventMessage.url}. Pamiętaj aby się pojawić i nie zawieść swoich fanów!`);
    }
    
    // public dateToCronExpression(date: Date): string {
    //     const minute = date.getMinutes();
    //     const hour = date.getHours();
    //     const dayOfMonth = date.getDate();
    //     const month = date.getMonth() + 1; // JavaScript months are 0-based
    //     const dayOfWeek = date.getDay(); // JavaScript days of week are 0-based
      
    //     return `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;
    // }

    public async handleCommunityEventRejectButton(buttonData: ButtonData) {
        console.log('handleCommunityEventRejectButton');

        const eventId = parseInt(buttonData.id.split(':')[1]);
        const communityEvent = await this.communityEventService.findById(eventId);

        if (!communityEvent) {
            // this.discordService.sendPrivateMessage(buttonData.user.id, `### :x: Wystąpił błąd podczas odrzucania wydarzenia\nWydarzenie nie zostało znalezione w bazie danych!`);
            buttonData.interaction.reply({
                content: `### :x: Wystąpił błąd podczas odrzucania wydarzenia\nWydarzenie nie zostało znalezione w bazie danych!`,
            })
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
            // this.discordService.sendPrivateMessage(buttonData.user.id, `### :x: Nie podano powodu odrzucenia wydarzenia w wyznaczonym czasie!`);
            buttonData.interaction.reply({
                content: `### :x: Nie podano powodu odrzucenia wydarzenia w wyznaczonym czasie!`,
            })
            return;
        }

        // communityEventRejectReason.deferUpdate();
        
        communityEventRejectReason.reply({
            content: `### :hourglass_flowing_sand: Przetwarzanie...`,
            ephemeral: true,
        })

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
            decisionBy: buttonData.user,
            approveState: 'rejected',
            imageUrl: communityEvent.imageUrl ?? undefined,
            color: communityEvent.color as `#${string}`,
            rejectReason: reason,
        };

        const approveMessage = await this.getApproveMessage(eventId, eventData);


        buttonData.message.edit(approveMessage);

        // this.discordService.sendPrivateMessage(buttonData.user.id, `### :white_check_mark: Wydarzenie nr. ${communityEvent.id} zostało odrzucone!`);
        communityEventRejectReason.editReply({
            content: `### :white_check_mark: Wydarzenie nr. ${communityEvent.id} zostało odrzucone!`,
        });

        this.discordService.sendPrivateMessage(communityEvent.user.discordId, `## :x: Przepraszamy ale Twoje wydarzenie o tytule *${communityEvent.name}* zostało odrzucone!\n**Powód:** *${reason}*\nMamy nadzieję, że uda Ci się w przyszłości!`);
        
    }

    public async handleCommunityEventReminderButton(buttonData: ButtonData) {
        console.log('handleCommunityEventReminderButton');

        buttonData.interaction.reply({
            content: `### :hourglass_flowing_sand: Przetwarzanie...`,
            ephemeral: true,
        });

        const eventId = parseInt(buttonData.id.split(':')[1]);
        let communityEvent = await this.communityEventService.findById(eventId);

        if (!communityEvent) {
            buttonData.interaction.editReply({
                content: `### :x: Wystąpił błąd podczas przypominania o wydarzeniu\nWydarzenie nie zostało znalezione w bazie danych!`,
            })
            return;
        }

        if (!communityEvent.startDate) {
            buttonData.interaction.editReply({
                content: `### :x: Wystąpił błąd podczas przypominania o wydarzeniu\nWydarzenie nie posiada daty rozpoczęcia!`,
            });
            return;
        }

        if (communityEvent.startDate.getTime() < Date.now()) {
            buttonData.interaction.editReply({
                content: `### :x: Nie ma o czym przypominać! Wydarzenie już się rozpoczęło!`,
            });
            return;
        }

        // If user is creator of event, don't allow him to remind himself
        if (communityEvent.user.discordId == buttonData.user.id) {
            buttonData.interaction.editReply({
                content: `### :x: Spokojnie i tak Ci przypomnimy o twoim wydarzeniu!`,
            })
            return;
        }

        if (!communityEvent.reminder) {
            buttonData.interaction.editReply({
                content: `### :x: Przepraszamy, ale administracja odmówiła wysyłania przypomnień o tym wydarzeniu!`,
            });
            return;
        }

        let user = await this.userService.findByDiscordId(buttonData.user.id);

        // If user doesn't exist, create one
        if (!user) {
            user = await this.userService.create({
                discordId: buttonData.user.id,
            });
        }

        const isAlreadyReminded = communityEvent.reminders.find(reminder => reminder.id == user.id);

        communityEvent = await this.communityEventService.setReminderForUser(eventId, user.id, !isAlreadyReminded);

        if (!communityEvent) {
            buttonData.interaction.editReply({
                content: `### :x: Wystąpił błąd podczas przypominania o wydarzeniu\nSkontaktuj się z administracją.`,
            })
            return;
        }

        const discordTimestamp = `<t:${Math.floor(communityEvent.startDate.getTime() / 1000)}:R>`;

        if (isAlreadyReminded) {
            buttonData.interaction.editReply({
                content: `### :white_check_mark: Nie zostaniesz powiadomiony o tym wydarzeniu.`,
            })
            return;
        } else {
            buttonData.interaction.editReply({
                content: `### :white_check_mark: Przypomnimy Ci o rozpoczęciu wydarzenia za ${discordTimestamp}.`,
            })
            return;
        }
    }

    /**
     * Handle admin turning off/on ability to send reminders about event
     * @param buttonData all data about button interaction
     */
    public async handleCommunityEventSwitchRemindersButton(buttonData: ButtonData) {
        console.log('handleCommunityEventSwitchRemindersButton');

        buttonData.interaction.reply({
            content: `### :hourglass_flowing_sand: Przetwarzanie...`,
            ephemeral: true,
        });

        const eventId = parseInt(buttonData.id.split(':')[1]);
        let communityEvent = await this.communityEventService.findById(eventId);

        if (!communityEvent) {
            // this.discordService.sendPrivateMessage(buttonData.user.id, `### :x: Wystąpił błąd podczas edycji wydarzenia\nWydarzenie nie zostało znalezione w bazie danych!`);
            buttonData.interaction.editReply({
                content: `### :x: Wystąpił błąd podczas edycji wydarzenia\nWydarzenie nie zostało znalezione w bazie danych!`,
            });
            return;
        }

        if (!communityEvent.startDate) {
            // this.discordService.sendPrivateMessage(buttonData.user.id, `### :x: Wystąpił błąd podczas edycji wydarzenia\nWydarzenie nie posiada daty rozpoczęcia!`);
            buttonData.interaction.editReply({
                content: `### :x: Wystąpił błąd podczas edycji wydarzenia\nWydarzenie nie posiada daty rozpoczęcia!`,
            });
            return;
        }

        if (communityEvent.startDate.getTime() < Date.now()) {
            // this.discordService.sendPrivateMessage(buttonData.user.id, `### :x: Nie można zmienić opcji - wydarzenie już się rozpoczęło!`);
            buttonData.interaction.editReply({
                content: `### :x: Nie można zmienić opcji - wydarzenie już się rozpoczęło!`,
            });
            return;
        }

        communityEvent = await this.communityEventService.update(eventId, {
            ...communityEvent,
            reminder: !communityEvent.reminder,
            color: communityEvent.color as `#${string}`,
        });

        let components = [];

        // If event has start date allow canceling it
        if (communityEvent.startDate && communityEvent.startDate.getTime() > Date.now()) {
            let row = new ActionRowBuilder();

            if (communityEvent.reminder) {
                const cancelButton = new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setLabel('Wyłącz Powiadomienia')
                .setCustomId(`community-event-switch-remind:${eventId}`)
                .setEmoji('❌');
    
                row.addComponents(cancelButton);

            }
            else {
                const remindButton = new ButtonBuilder()
                    .setStyle(ButtonStyle.Primary)
                    .setLabel('Włącz Powiadomienia')
                    .setCustomId(`community-event-switch-remind:${eventId}`)
                    .setEmoji('🔔');
    
                row.addComponents(remindButton);
            }

            components.push(row as any);
        }

        buttonData.message.edit({
            components,
        });

        if (!communityEvent) {
            // this.discordService.sendPrivateMessage(buttonData.user.id, `### :x: Wystąpił błąd podczas edycji wydarzenia\nSkontaktuj się z administracją.`);
            buttonData.interaction.editReply({
                content: `### :x: Wystąpił błąd podczas edycji wydarzenia\nSkontaktuj się z administracją.`,
            });
            return;
        }

        if (communityEvent.reminder) {
            // this.discordService.sendPrivateMessage(buttonData.user.id, `### :white_check_mark: Przypomnienia o wydarzeniu ${communityEvent.id} zostały włączone.`);
            buttonData.interaction.editReply({
                content: `### :white_check_mark: Przypomnienia o wydarzeniu ${communityEvent.id} zostały włączone.`,
            });
            return;
        } else {
            // this.discordService.sendPrivateMessage(buttonData.user.id, `### :white_check_mark: Przypomnienia o wydarzeniu ${communityEvent.id} zostały wyłączone.`);
            buttonData.interaction.editReply({
                content: `### :white_check_mark: Przypomnienia o wydarzeniu ${communityEvent.id} zostały wyłączone.`,
            });
            return;
        }
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
                    name: 'Rozpocznie się',
                    value: startTimestamp,
                }
            ]);
        }

        if (endTimestamp) {
            embed.addFields([
                {
                    name: 'Zakończy się',
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

    private async remindUsersAboutEvent(eventId: number) {
        const communityEvent = await this.communityEventService.findById(eventId);

        if (!communityEvent) {
            console.error(`Event with id ${eventId} not found!`);
            return;
        }

        if (!communityEvent.startDate) {
            console.error(`Event with id ${eventId} doesn't have start date!`);
            return;
        }

        const communityEventsChannel = await this.channelService.findByName('communityevents');

        if (!communityEventsChannel) {
            console.error('Community events channel not found!');
            return;
        }

        const eventEmbed = await this.getEventEmbed({
            title: communityEvent.name,
            description: communityEvent.description,
            startDate: communityEvent.startDate,
            endDate: communityEvent.endDate,
            user: await this.discordService.getMemberById(communityEvent.user.discordId),
            approveState: 'approved',
            color: communityEvent.color as `#${string}`,
            imageUrl: communityEvent.imageUrl ?? undefined,
        });

        eventEmbed.setFooter({
            text: `Polskie Legendy Apex • Chcesz utworzyć własne wydarzenie? Użyj komendy /wydarzenie stwórz`,
            iconURL: this.configService.get<string>('images.logo-transparent')
        });

        const components = [];

        const remindButton = new ButtonBuilder()
            .setStyle(ButtonStyle.Primary)
            .setLabel('Powiadom o rozpoczęciu')
            .setCustomId(`community-event-remind:${communityEvent.id}`)
            .setEmoji('🔔');
        
        components.push(new ActionRowBuilder()
            .addComponents(remindButton) as any);

        this.discordService.sendPrivateMessage(communityEvent.user.discordId, `## :bell: Twoje wydarzenie o tytule *${communityEvent.name}* rozpoczyna się!\nPamiętaj aby się pojawić!`, [eventEmbed]);

        communityEvent.reminders.forEach(async reminder => {
            this.discordService.sendPrivateMessage(reminder.discordId, `## :bell: Wydarzenie *${communityEvent.name}* właśnie się rozpoczyna! Organizator na pewno czeka na Ciebie!`, [eventEmbed]);
        });
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
                approveStateText = `Zatwierdzone :white_check_mark:\n**Zatwierdzone przez:** ${eventData?.decisionBy}`;
                break;
            case 'rejected':
                approveStateText = `Odrzucone :x:\n**Powód:** *${eventData?.rejectReason ?? `brak`}*\n**Odrzucone przez:** ${eventData?.decisionBy}`;
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
                    .setLabel('Wyłącz Powiadomienia')
                    .setCustomId(`community-event-switch-remind:${eventId}`)
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
