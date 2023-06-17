import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MessageData, TypingData } from '../discord.listeners';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import * as hash from 'object-hash';
import { Cache } from 'cache-manager';
import { User } from 'discord.js';
import { DiscordService } from '../discord.service';
import { MessageService } from 'src/database/entities/message/message.service';
import { UserService } from 'src/database/entities/user/user.service';
import { ChannelService } from 'src/database/entities/channel/channel.service';

@Injectable()
export class IntroduceService {

    constructor (
        private readonly configService: ConfigService,
        @Inject(CACHE_MANAGER)
        private readonly cache: Cache,
        private readonly discordService: DiscordService,
        private readonly messageService: MessageService,
        private readonly userService: UserService,
        private readonly channelService: ChannelService,
    ) {}

    public async handleIntroduceMessage(message: MessageData) {
        console.log(`User ${message.user.username} sent message ${message.message.content} in ${message.channel.id}`)

        // Abort if user is a bot
        if (message.user.bot)
            return;

        // Check if user exists in database
        // If not, create user
        const dbUser = await this.userService.getOrCreateByDiscordUser(message.user);
        
        if (!dbUser) {
            console.error(`User ${message.user.username} not found in guild!`)
            return;
        }
            
        const dbMessage = await this.messageService.findByUserIdAndName(dbUser.id, 'introduce');
        // Check if dbMessage still exists on Discord
        const discordMessage = (!!dbMessage) ? await this.discordService.getMessage(dbMessage.channel.discordId, dbMessage.discordId) : null;

        // If message exists in database but not on Discord,
        // delete from database
        if (!!dbMessage && !discordMessage) {
            console.log(`Message ${dbMessage.id} not found on Discord!`)
    
            // Delete message from database
            await this.messageService.delete(dbMessage.id);
        }

        // If message is not already in database
        // greet and save to database
        if (!dbMessage || !discordMessage) {
            message.message.react('👋');

            const dbChannel = await this.channelService.findByDiscordId(message.channel.id);

            if (!dbChannel) {
                console.error(`Channel ${message.channel.id} not found in database!`)
                return;
            }

            const newDbMessage = await this.messageService.create({
                discordId: message.message.id,
                name: 'introduce',
                channelId: dbChannel.id,
            }, dbUser.id);

            console.log(`Created message ${newDbMessage.id} for user ${dbUser.id} in channel ${message.channel.id}`)

            return;
        }

        // Message is already in database and on Discord

        message.message.delete();

        this.discordService.sendPrivateMessage(message.user.id, this.getIntroduceDuplicateMessage(message.user as User));
    }

    public async handleIntroduceTyping(typing: TypingData) {
        const typingHash = hash(typing);

        const nextMonthTTL = 60 * 60 * 24 * 30;

        // If user already typed once, ignore
        if (await this.cache.get(`introduce-typing-${typingHash}`))
            return;

        // Set cache for 1 month
        this.cache.set(`introduce-typing-${typingHash}`, true, nextMonthTTL);

        this.discordService.sendPrivateMessage(typing.user.id, this.getIntroduceTipsMessage(typing.user as User));
    }

    private getIntroduceTipsMessage (user: User): string {
        const messageParts = [
            `Psst, <@${user.id}>, zauważyłem że tworzysz swoją pierwszą wiadomość powitalną!`,
            `Parę inspiracji dla ciebie:`,
            `- Co tu robisz? Co Cię tu sprowadza?`,
            `- Jakim typem gracza jesteś? Niech inni wiedzą z kim mają do czynienia!`,
            '- Jakieś osiągnięcia? Jakieś ciekawe fakty o tobie?',
            '- Brałeś udział w jakichś turniejach? Jakieś ciekawe mecze?',
            `- Czego szukasz? Jakieś znajomości? Drużynę do grania?`,
            '',
            `Niech ta wiadomość stanowi przyjazne *cześć*! Witamy na serwerze! :wave:`
        ];

        return messageParts.join('\n');
    }

    private getIntroduceDuplicateMessage (user: User): string {
        const messageParts = [
            `Hej, <@${user.id}>, możesz napisać tylko jedną wiadomość powitalną!`,
            `Jeśli chcesz ją zmienić, po prostu edytuj swoją wiadomość!`,
        ];

        return messageParts.join('\n');
    }
}
