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

    @Subcommand({
        name: 'dołącz',
        description: 'Dołącz do aktualnego konkursu Polskich Legend Apex',
    })
    public async onGiveawayJoin(@Context() [Interaction]: SlashCommandContext, @Options() options: handleGivewayJoinCommandDto) {
        console.log('onGiveawayJoin');

        // interaction.reply({
        //     content: '## :x: Przepraszamy, ale aktualnie nie żaden konkurs nie jest aktywny.',
        //     ephemeral: true,
        // });
        // return;

        this.giveawayService.handleGiveawayJoinDiscordCommand(Interaction, options);
    }

    @Subcommand({
        name: 'status',
        description: 'Sprawdź status aktualnego konkursu Polskich Legend Apex',
    })
    public async onGiveawayStatus(@Context() [Interaction]: SlashCommandContext) {
        console.log('onGiveawayStatus');

        this.giveawayService.handleGiveawayStatusDiscordCommand(Interaction);
    }

    @Subcommand({
        name: 'zrezygnuj',
        description: 'Zrezygnuj z uczestnictwa w konkursie Polskich Legend Apex',
    })
    public async onGiveawayResign(@Context() [Interaction]: SlashCommandContext) {
        console.log('onGiveawayResign');

        this.giveawayService.handleGiveawayResignDiscordCommand(Interaction);
    }
}
