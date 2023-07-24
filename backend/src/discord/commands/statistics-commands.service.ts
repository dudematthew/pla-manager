import { Injectable } from "@nestjs/common";
import { Context, Options, SlashCommandContext, Subcommand, createCommandGroupDecorator } from "necord";
import { ApexStatisticsService } from "../apex-statistics/apex-statistics.service";
import { handleStatisticsDiscordCommandDto } from "./dtos/handle-statistics-discord-command.dto";
import { handleStatisticsApexCommandDto } from "./dtos/handle-statistics-apex-command.dto";


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
     * Check discord user statistics
     */
     @Subcommand({
        name: 'użytkownik',
        description: 'Sprawdź statystyki dla członka Discorda PLA',
    })
    public async onStatisticsDiscordCheck(@Context() [Interaction]: SlashCommandContext, @Options() options: handleStatisticsDiscordCommandDto) {
        this.apexStatisticsService.handleStatisticsDiscordCommand(Interaction, options);
    }

    /**
     * Check apex user statistics
     */
    @Subcommand({
        name: 'apex',
        description: 'Sprawdź statystyki dla gracza Apex Legends',
    })
    public async onStatisticsApexCheck(@Context() [Interaction]: SlashCommandContext, @Options() options: handleStatisticsApexCommandDto) {
        this.apexStatisticsService.handleStatisticsApexCommand(Interaction, options);
    }

    /**
     * Check own statistics
     */
    @Subcommand({
        name: 'moje',
        description: 'Sprawdź swoje statystyki',
    })
    public async onStatisticsOwnCheck(@Context() [Interaction]: SlashCommandContext) {
        this.apexStatisticsService.handleStatisticsOwnCommand(Interaction);
    }
}
