import { Command, Handler } from '@discord-nestjs/core';
import { CommandInteraction } from 'discord.js';
import { Injectable } from '@nestjs/common';
import { RoleService } from 'src/role/role.service';
import { EmbedBuilder } from 'discord.js';

@Command({
  name: 'lista-rol',
  description: 'Sprawdź listę zapisanych ról',
})
@Injectable()
export class ListRolesCommand {
    constructor(
        private readonly roleService: RoleService,
    ) {}

  @Handler() 
  async onPlaylist(interaction: CommandInteraction) {

    
    // Make a Discord Embed showing all roles in database
    let embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Lista zapisanych ról')
        .setDescription('Lista zapisanych ról')
        .setTimestamp();
    // Get all roles from database
    const roles = await this.roleService.findAll();
    // Add each role to embed
    roles.forEach(role => {
        embed.addFields({
            name: role.name, 
            value: role.discordId
        });
    });
    // Send embed to channel
    interaction.reply({ embeds: [embed] });
  }
}