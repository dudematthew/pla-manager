import { Injectable, UseFilters, UseGuards } from "@nestjs/common";
import { Context, Options, SlashCommandContext, Subcommand, createCommandGroupDecorator } from "necord";
import { AdminGuard } from "../guards/admin.guard";
import { ForbiddenExceptionFilter } from "../filters/forbidden-exception.filter";
import { AdminEmojiDto } from "./dtos/admin-emoji.dto";
import { EmojiService } from "src/database/entities/emoji/emoji.service";

export const AdminCommandsDecorator = createCommandGroupDecorator({
    name: 'admin',
    description: 'Komendy administratorskie',
    guilds: [process.env.MAIN_GUILD_ID]
})

@Injectable()
@AdminCommandsDecorator()
export class AdminCommandsService {

    constructor(
        private readonly emojiService: EmojiService,
    ) {}

    @UseGuards(AdminGuard)
    @UseFilters(ForbiddenExceptionFilter)
    @Subcommand({
        name: 'emoji',
        description: 'Ustaw emoji w bazie danych',
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
}