import { Injectable, Logger } from '@nestjs/common';
import { Context, On, Once, ContextOf } from 'necord';
import { Client } from 'discord.js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DiscordUpdate {
    private readonly logger = new Logger(DiscordUpdate.name);

    public constructor(
        private readonly client: Client,
        private readonly configService: ConfigService,
        ) {}

    @Once('ready')
    public onReady(@Context() [client]: ContextOf<'ready'>) {
        this.logger.log(`Bot logged in as ${client.user.username}`);
    }

    @On('warn')
    public onWarn(@Context() [message]: ContextOf<'warn'>) {
        this.logger.warn(message);
    }
}