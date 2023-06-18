import { Injectable, UseInterceptors } from '@nestjs/common';
import { AutocompleteInteraction, CommandInteraction } from 'discord.js';
import { AutocompleteInterceptor, Ctx, Opts, SlashCommand } from 'necord';

// todo: implement this
@Injectable()
class AnimeAutocompleteInterceptor extends AutocompleteInterceptor {
    public transformOptions(interaction: AutocompleteInteraction) {
        const focused = interaction.options.getFocused(true);
        let choices: string[];

        if (focused.name === 'anime') {
            choices = ['Hunter x Hunter', 'Naruto', 'One Piece'];
        }

        return interaction.respond(
            choices
                .filter(choice => choice.startsWith(focused.value.toString()))
                .map(choice => ({ name: choice, value: choice }))
        );
    }
}