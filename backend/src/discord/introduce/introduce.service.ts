import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MessageData, TypingData } from '../discord.listeners';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import * as hash from 'object-hash';
import { Cache } from 'cache-manager';
import { User } from 'discord.js';
import { DiscordService } from '../discord.service';

@Injectable()
export class IntroduceService {

    constructor (
        private readonly configService: ConfigService,
        @Inject(CACHE_MANAGER)
        private readonly cache: Cache,
        private readonly discordService: DiscordService,
    ) {}

    public handleIntroduceMessage(message: MessageData) {
        console.log(`User ${message.user.username} sent message ${message.message.content} in ${message.channel.id}`)


    }

    public async handleIntroduceTyping(typing: TypingData) {
        console.log(`User ${typing.user.username} is typing in ${typing.channel.id}`);

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
}
