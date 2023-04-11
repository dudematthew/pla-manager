import { Command, Handler } from '@discord-nestjs/core';
import { CommandInteraction } from 'discord.js';
import { Injectable } from '@nestjs/common';

@Command({
  name: 'ping',
  description: 'Sprawdź czy bot żyje',
})
@Injectable()
export class PingCommand {
  @Handler() 
  onPlaylist(interaction: CommandInteraction): string {
    return 'Pong! żyję jak najbardziej!';
  }
}