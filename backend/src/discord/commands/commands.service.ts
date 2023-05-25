import { Injectable, UseFilters, UseGuards } from '@nestjs/common';
import { Context, Options, Options, SlashCommand, SlashCommandContext } from 'necord';
import { RoleService } from 'src/database/entities/role/role.service';
import { EmbedBuilder } from 'discord.js';
import { ConfigService } from '@nestjs/config';
import { InsideService } from '../inside/inside.service';
import { AdminGuard } from '../guards/admin.guard';
import { EmojiService } from 'src/database/entities/emoji/emoji.service';
import { ForbiddenExceptionFilter } from '../filters/forbidden-exception.filter';
import { AdminEmojiDto } from './dtos/admin-emoji.dto';
import { ApexConnectService } from '../apex-connect/apex-connect.service';
import { Logger } from '@nestjs/common';
import { handleConnectCommandDto } from './dtos/handle-connect.command.dto';
// import * as paginationEmbed from 'discord.js-pagination';

@Injectable()
export class CommandsService {

    private readonly logger = new Logger(CommandsService.name);

    constructor(
        private readonly roleService: RoleService,
        private readonly configService: ConfigService,
        private readonly insideService: InsideService,
        private readonly emojiService: EmojiService,
        private readonly apexConnectService: ApexConnectService,
    ) {}
    
    /**
     * Ping!
     * @returns Pong! 
     */
    @SlashCommand({
        name: 'ping',
        description: 'Ping!',
        guilds: [process.env.MAIN_GUILD_ID]
    })
    public async onPing(@Context() [Interaction]: SlashCommandContext) {
        return Interaction.reply({ content: 'Pong!', ephemeral: true});
    }

    /**
     * Get all roles from the database
     * @returns All roles
     */
    @SlashCommand({
        name: 'getroles',
        description: 'Lista wszystkich ról',
        guilds: [process.env.MAIN_GUILD_ID]
    })
    public async onGetRoles(@Context() [Interaction]: SlashCommandContext) {
        const roles = await this.roleService.findAll();

        const pages = [];

        // let page = 1;
        // roles.forEach(role => {
        //     let roleEmbed: EmbedBuilder;
            
        //     // Every 10 roles, create a new page
        //     if (page % 10 === 0 || page === 1) {
        //         roleEmbed = new EmbedBuilder()
        //             .setTitle('Lista ról')
        //             .setColor(this.configService.get('theme.color-primary'))
        //             .setTimestamp()
        //             .setAuthor({
        //                 name: 'Polskie Legendy Apex',
        //                 iconURL: this.configService.get('images.logo')
        //             });
        //     }

        //     roleEmbed.addFields({
        //         name: role.name,
        //         value: `<@&${role.discordId}> - ${role.discordId}`,
        //     });

        //     // Every 10 roles, push the page to the pages array
        //     if (page % 10 === 0) {
        //         pages.push(roleEmbed);
        //     }
        // });

        // // For loop variation
        // for (let i = 0; i < roles.length; i++) {
        //     let roleEmbed: EmbedBuilder;

        //     // Every 10 roles, create a new page
        //     if (i % 2 === 0 || i === 1) {
        //         roleEmbed = new EmbedBuilder()
        //         .setTitle('Lista ról')
        //             .setColor(this.configService.get('theme.color-primary'))
        //             .setTimestamp()
        //             .setAuthor({
        //                 name: 'Polskie Legendy Apex',
        //                 iconURL: this.configService.get('images.logo')
        //             });

        //         pages.push(roleEmbed);
        //     }

        //     pages[pages.length - 1].addFields({
        //         name: roles[i].name,
        //         value: `<@&${roles[i].discordId}> - ${roles[i].discordId}`,
        //     });
        // }

        // const embed = paginationEmbed(Interaction, pages, ['⏪', '⏩'], 30000);
        
        // return Interaction.reply({ embeds: [roleEmbed], ephemeral: true});
    }

    /**
     * Get all members of PLA Inside
     */
    @SlashCommand({
        name: 'pla-inside-wykaz',
        description: 'Wykaz członków PLA Inside',
        guilds: [process.env.MAIN_GUILD_ID]
    })
    public async onGetInsideMembers(@Context() [Interaction]: SlashCommandContext) {
        this.insideService.handleGetInsideMembers(Interaction);
    }

    @UseGuards(AdminGuard)
    @UseFilters(ForbiddenExceptionFilter)
    @SlashCommand({
        name: 'admin-emoji',
        description: 'Ustaw emoji w bazie danych',
        guilds: [process.env.MAIN_GUILD_ID]
    })
    public async onAdminEmoji(@Context() [Interaction]: SlashCommandContext, @Options() options: AdminEmojiDto) {
        console.log(`[CommandsService] onAdminEmoji: ${options.emoji} - ${options.emojiName}`);

        const emoteRegex = /<:.+?:\d+>/g;
        const animatedEmoteRegex = /<a:.+:(\d+)>/gm;

        let emojis = [];

        if (emoteRegex.test(options.emoji)) {
            emojis = options.emoji.match(emoteRegex);
        } else if (animatedEmoteRegex.test(options.emoji)) {
            Interaction.reply({ content: 'Animowane emoji nie są jeszcze wspierane!', ephemeral: true});
        return false;
        } else {
            Interaction.reply({ content: 'Niepoprawne emoji!', ephemeral: true});
        }

        const dbEmoji = await this.emojiService.findByName(options.emojiName);

        const emojiData = {
            discordId: emojis[0].match(/\d+/g)[0],
            discordName: emojis[0].split(":")[1],
            name: options.emojiName,
        }

        console.log('Prepared emoji data: ', emojiData);

        if (!dbEmoji) {
            // Create emoji
            const newEmoji = await this.emojiService.create(emojiData);

            if (!newEmoji) {
                Interaction.reply({ content: 'Nie udało się dodać emoji', ephemeral: true});
            }

            Interaction.reply({ content: `Dodano emoji!`, ephemeral: true});
        } else {
            // Update emoji
            const updatedEmoji = await this.emojiService.update(dbEmoji.id, emojiData);

            if (!updatedEmoji) {
                Interaction.reply({ content: 'Nie udało się zaktualizować emoji', ephemeral: true});
            }

            Interaction.reply({ content: `Emoji zaktualizowane!`, ephemeral: true});
        }
    }

    /**
     * Get all roles from the database
     * @returns All roles
     */
    @SlashCommand({
        name: 'połącz',
        description: 'Połącz swoje konto Apex z kontem na Discordzie PLA',
    })
    public async onApexAccountConnect(@Context() [Interaction]: SlashCommandContext, @Options() { username, platform }: handleConnectCommandDto) {
        this.logger.log(`User ${Interaction.user.username} requested to connect their Apex account`);
        this.apexConnectService.handleConnectCommand(Interaction, { username, platform });
    }
}
