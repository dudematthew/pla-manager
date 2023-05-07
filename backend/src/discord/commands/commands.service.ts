import { Injectable } from '@nestjs/common';
import { Context, SlashCommand, SlashCommandContext } from 'necord';
import { RoleService } from 'src/database/entities/role/role.service';
import { EmbedBuilder } from 'discord.js';

@Injectable()
export class CommandsService {

    constructor(
        private readonly roleService: RoleService,
    ) {}
    
    /**
     * Ping!
     * @returns Pong! 
     */
    @SlashCommand({
        name: 'ping',
        description: 'Ping!',
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
    })
    public async onGetRoles(@Context() [Interaction]: SlashCommandContext) {
        const roles = await this.roleService.findAll();
        const roleEmbed = new EmbedBuilder()
            .setTitle('Lista ról')
            .setColor('#0099ff')
            .setTimestamp()
            .setAuthor({
                name: 'Polskie Legendy Apex',
                iconURL: 'https://i.imgur.com/u4DEkaz.png'
            });

        roles.forEach(role => {
            roleEmbed.addFields({
                name: role.name,
                value: `<@&${role.discordId}> - ${role.discordId}`,
            });
        });

        return Interaction.reply({ embeds: [roleEmbed], ephemeral: true});
    }
}
