import { EmbedBuilder } from "@discordjs/builders";
import { ArgumentsHost, Catch, ExceptionFilter, ForbiddenException, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SlashCommandContext } from "necord";

@Catch(ForbiddenException)
export class ForbiddenExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(ForbiddenExceptionFilter.name);

    constructor(
        private readonly configService: ConfigService,
    ) {}

    async catch(exception: Error, host: ArgumentsHost) {
        const [interaction] = host.getArgByIndex<SlashCommandContext>(0) ?? [ undefined ];

        // Build nice embed message for the user to see

        const embed = new EmbedBuilder()
            .setTitle('❌ Brak uprawnień!')
            .setDescription('Nie masz uprawnień do wykonania tej komendy!')
            .setColor(this.configService.get('color-primary'))
            .setTimestamp()
            .setAuthor({
                name: 'Polskie Legendy Apex',
                iconURL: this.configService.get('logo'),
            })
            
        await interaction.reply({
            embeds: [ embed ],
            ephemeral: true,
        });

        this.logger.error(`Użytkownik ${interaction.user.username} (${interaction.user.id}) nie ma uprawnień do wykonania komendy ${interaction.commandName}!`)
    }
}