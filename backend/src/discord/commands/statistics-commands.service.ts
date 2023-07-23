import { Injectable } from "@nestjs/common";
import { Context, Options, SlashCommandContext, Subcommand, createCommandGroupDecorator } from "necord";
import { ApexStatisticsService } from "../apex-statistics/apex-statistics.service";
import { handleStatisticsDiscordCommandDto } from "./dtos/handle-statistics-discord-command.dto copy";


export const StatisticsCommandsDecorator = createCommandGroupDecorator({
    name: 'statystyki',
    description: 'Komendy dotyczące wyświetlania statystyk Apex Legends',
    guilds: [process.env.MAIN_GUILD_ID]
})

@Injectable()
@StatisticsCommandsDecorator()
export class StatisticsCommandsService {
    
    constructor(
        private readonly apexStatisticsService: ApexStatisticsService,
    ) {}

     /**
     * Check player statistics
     */
     @Subcommand({
        name: 'użytkownik',
        description: 'Sprawdź statystyki dla członka Discorda PLA',
    })
    public async onStatisticsDiscordCheck(@Context() [Interaction]: SlashCommandContext, @Options() options: handleStatisticsDiscordCommandDto) {
        this.apexStatisticsService.handleStatisticsDiscordCommand(Interaction, options);
    }
}
