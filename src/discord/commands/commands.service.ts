import { Injectable } from '@nestjs/common';
import { Context, SlashCommand, SlashCommandContext } from 'necord';

@Injectable()
export class CommandsService {
    @SlashCommand({
        name: 'ping',
        description: 'Ping!',
    })
    public async onPing(@Context() [Interaction]: SlashCommandContext) {
        return Interaction.reply({ content: 'Pong!', ephemeral: true});
    }
}
