import { Injectable } from "@nestjs/common";
import { Context, SlashCommandContext, Subcommand, createCommandGroupDecorator } from "necord";
import { InsideService } from "../inside/inside.service";


export const InsideCommandsDecorator = createCommandGroupDecorator({
    name: 'inside',
    description: 'Komendy dotyczące PLA Inside',
    guilds: [process.env.MAIN_GUILD_ID]
})

@Injectable()
@InsideCommandsDecorator()
export class InsideCommandsService {
    
    constructor(
        private readonly insideService: InsideService,
    ) {}

    /**
     * Get all members of PLA Inside
     */
    @Subcommand({
        name: 'wykaz',
        description: 'Wykaz członków PLA Inside'
    })
    public async onGetInsideMembers(@Context() [Interaction]: SlashCommandContext) {
        this.insideService.handleGetInsideMembers(Interaction);
    }
}
