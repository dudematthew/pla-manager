import { Injectable } from "@nestjs/common";
import { Context, Options, SlashCommandContext, Subcommand, createCommandGroupDecorator } from "necord";
import { CommunityEventsService } from "../community-events/community-events.service";
import { handleCommunityEventCreateDiscordCommandDto } from "./dtos/handle-community-events-create-discord-command";


export const CommunityEventsCommandsDecorator = createCommandGroupDecorator({
    name: 'wydarzenie',
    description: 'Komendy dotyczące wydarzeń społeczności',
    guilds: [process.env.MAIN_GUILD_ID]
})

@Injectable()
@CommunityEventsCommandsDecorator()
export class CommunityEventsCommandService {
    
    constructor(
        private readonly communityEventsService: CommunityEventsService,
    ) {}

     /**
     * Create community event
     */
    @Subcommand({
        name: 'stwórz',
        description: 'Stwórz twoje własne wydarzenie społeczności',
    })
    public async onCommunityEventCreate(@Context() [Interaction]: SlashCommandContext, @Options() options: handleCommunityEventCreateDiscordCommandDto) {
        console.log('onCommunityEventCreate');

        this.communityEventsService.handleCommunityEventCreateDiscordCommand(Interaction, options);
    }

    /**
     * Update community event
     */
    // @Subcommand({
    //     name: 'edytuj',
    //     description: 'Edytuj twoje wydarzenie społeczności',
    // })
    // public async onCommunityEventUpdate(@Context() [Interaction]: SlashCommandContext, @Options() options: handleCommunityEventCreateDiscordCommandDto) {
    //     console.log('onCommunityEventUpdate');
    // }

    /**
     * Delete community event
    */
    // @Subcommand({
    //     name: 'usuń',
    //     description: 'Usuń twoje wydarzenie społeczności',
    // })
    // public async onCommunityEventDelete(@Context() [Interaction]: SlashCommandContext, @Options() options: handleCommunityEventCreateDiscordCommandDto) {
    //     console.log('onCommunityEventDelete');
    // }
}
