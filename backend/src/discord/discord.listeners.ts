import { Injectable } from "@nestjs/common";
import { LfgService } from "./lfg/lfg.service";
import { Message, User, Channel, ChannelType, Typing, PartialUser } from "discord.js";
import { ChannelService } from "src/database/entities/channel/channel.service";
import { ChannelEntity } from "src/database/entities/channel/channel.entity";
import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApexConnectService } from "./apex-connect/apex-connect.service";
import { IntroduceService } from "./introduce/introduce.service";

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

export interface MessageData {
    channel: Channel;
    message: Message;
    user: User
}

export interface TypingData {
    channel: Channel;
    user: User | PartialUser;
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
        console.log('Escaped value: ' + result);
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

            console.log('Matched listener: ' + listener);

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
}

