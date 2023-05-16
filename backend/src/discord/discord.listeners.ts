import { Injectable } from "@nestjs/common";
import { LfgService } from "./lfg/lfg.service";
import { Message, User, Channel } from "discord.js";
import { ChannelService } from "src/database/entities/channel/channel.service";
import { ChannelEntity } from "src/database/entities/channel/channel.entity";
import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

interface MessageCreateListener {
    channelPattern: string;
    messagePattern: string;
    userPattern: string;
    callback: (message: MessageData) => void;
}

export interface MessageData {
    channel: Channel;
    message: Message;
    user: User;
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

    /**
     * The logger instance
     */
    private readonly logger = new Logger(DiscordListeners.name);

    constructor(
        private readonly lfgService: LfgService,
        private readonly channelService: ChannelService,
        private readonly configService: ConfigService,
    ) {
        this.wcmatch = require('wildcard-match');
        
        /**
         * The message create listeners - these are the listeners that should be
         * activated when a message is created.
         * @var MessageCreateListener[]
         */
        this.messageCreateListeners = [
            // The lfg message listener
            {
                channelPattern: this.configService.get<string>('channel-names.lfg'),
                messagePattern: '*',
                userPattern: '*',
                callback: (messageData: MessageData) => {
                    this.lfgService.handleLfgMessage(messageData);
                },
            },
        ];
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
            // Check if channel matches database channel ------------------------------
            let dbChannel: ChannelEntity = await this.channelService.findByName(listener.channelPattern);

            // If channel is in database
            if (dbChannel) {
                if (dbChannel.discordId !== messageData.channel.id) {
                    return; // (skip to next listener
                }
            } 
            // If channel id matches pattern
            else if (!this.matchPattern(messageData.channel.id, listener.channelPattern))
                return; // (skip to next listener)

            // Check if message matches pattern ------------------------------
            if (!this.matchPattern(messageData.message.content, listener.messagePattern))
                return; // (skip to next listener)

            // Check if user matches pattern ------------------------------
            if (!this.matchPattern(messageData.user.id, listener.userPattern))
                return; // (skip to next listener)

            // If all patterns match, add callback to callbacks
            callbacks.push(listener.callback);
        }

        // Call all callbacks
        callbacks.forEach((callback: (message: MessageData) => void) => {
            try {
                callback(messageData);
            } catch (e) {
                this.logger.error(e);
            }

        });
    }
}

