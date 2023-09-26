import { Injectable } from "@nestjs/common";
import { Context, Options, SlashCommandContext, Subcommand, createCommandGroupDecorator } from "necord";
import { CommunityEventsService } from "../community-events/community-events.service";
import { GiveawayService } from "../giveaway/giveaway.service";
import { handleGivewayJoinCommandDto } from "./dtos/handle-giveaway-join-command.dto.ts";


export const GiveawayCommandsDecorator = createCommandGroupDecorator({
    name: 'konkurs',
    description: 'Komendy dotyczące aktualnego konkursu',
    guilds: [process.env.MAIN_GUILD_ID]
})

@Injectable()
@GiveawayCommandsDecorator()
export class GiveawayCommandService {
    
    constructor(
        private readonly giveawayService: GiveawayService
    ) {}

     /**
     * Create community event
     */
    @Subcommand({
        name: 'dołącz',
        description: 'Dołącz do aktualnego konkursu Polskich Legend Apex',
    })
    public async onGiveawayJoin(@Context() [Interaction]: SlashCommandContext, @Options() options: handleGivewayJoinCommandDto) {
        console.log('onGiveawayJoin');

        Interaction.reply({
            content: '## :x: Przepraszamy, ale aktualnie nie żaden konkurs nie jest aktywny.',
            ephemeral: true,
        });

        this.giveawayService.handleGiveawayJoinDiscordCommand(Interaction, options);

        // this.communityEventsService.handleCommunityEventCreateDiscordCommand(Interaction, options);
    }
}
