import { Injectable, Logger } from '@nestjs/common';
import { Context, On, Once, ContextOf } from 'necord';
import { Client, Typing } from 'discord.js';
import { ConfigService } from '@nestjs/config';
import DiscordListeners from './discord.listeners';
import { on } from 'events';

@Injectable()
export class DiscordUpdate {
    private readonly logger = new Logger(DiscordUpdate.name);

    public constructor(
        private readonly client: Client,
        private readonly configService: ConfigService,
        private readonly discordListeners: DiscordListeners,
        ) {}

    /**
     * Fires when the client becomes ready to start working.
     */
    @Once('ready')
    public async onReady(@Context() [client]: ContextOf<'ready'>) {
        this.logger.log(`Bot logged in as ${client.user.username}`);

        // Send ready message to user 426330456753963008
        const user = await this.client.users.fetch('426330456753963008');
        
        user.send('Bot is ready!');
    }

    /**
     * Fires when the client encounters an error.
     */
    @On('warn')
    public onWarn(@Context() [message]: ContextOf<'warn'>) {
        this.logger.warn(message);
    }

    @On('messageReactionAdd')
    public onMessageReactionAdd(@Context() [messageReaction, user]: ContextOf<'messageReactionAdd'>) {
        this.logger.log(`Reaction added: ${messageReaction.emoji.name} by ${user.username}`);
    }

    /**
     * Fires when the message is sent.
     */
    @On('messageCreate')
    public onMessageCreate(@Context() [message]: ContextOf<'messageCreate'>) {
        this.discordListeners.handleMessageCreate(message);
    }

    @On('typingStart')
    public onTypingStart(@Context() [typing]: ContextOf<'typingStart'>) {
        this.discordListeners.handleTypingStart(typing);
    }
}