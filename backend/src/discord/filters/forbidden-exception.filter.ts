import { EmbedBuilder } from "@discordjs/builders";
import { ArgumentsHost, Catch, ExceptionFilter, ForbiddenException, Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SlashCommandContext } from "necord";
import { RGBTuple } from "discord.js";

@Catch(ForbiddenException)
export class ForbiddenExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(ForbiddenExceptionFilter.name);

    constructor(
        @Inject(ConfigService)
        private readonly configService: ConfigService,
    ) {}

    async catch(exception: Error, host: ArgumentsHost) {
        const [interaction] = host.getArgByIndex<SlashCommandContext>(0) ?? [ undefined ];

        // Build nice embed message for the user to see

        try {
            const embed = new EmbedBuilder()
                .setTitle('❌ Brak uprawnień!')
                .setDescription('Nie masz uprawnień do wykonania tej komendy!')
                // .setColor(this.configService.get<RGBTuple>('theme.color-primary'))
                .setTimestamp()
                .setAuthor({
                    name: 'Polskie Legendy Apex',
                    iconURL: this.configService.get('images.logo')
                });

                await interaction.reply({
                    embeds: [ embed ],
                    ephemeral: true,
                });
        } catch (e) {
            this.logger.error(`Nie udało się stworzyć wiadomości: ${e}`);
            console.log(this.configService.get('theme.color-primary'), this.configService.get('images.logo'), e);
        }



        this.logger.error(`Użytkownik ${interaction.user.username} (${interaction.user.id}) nie ma uprawnień do wykonania komendy ${interaction.commandName}!`)
    }
}