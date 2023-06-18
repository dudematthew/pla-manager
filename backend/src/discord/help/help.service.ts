import { Injectable, Logger } from '@nestjs/common';
import { DiscordService } from '../discord.service';
import { ApplicationCommand, ApplicationCommandOptionData, ApplicationCommandOptionType, ApplicationCommandType, CacheType, ChatInputCommandInteraction } from 'discord.js';
import { MenuOption, Row, RowTypes } from 'discord.js-menu-buttons';

interface ICommand {
    name: string;
    description: string;
    options?: ICommandOption[];
}

interface ICommandOption {
    name: string;
    description: string;
    type: number;
    required?: boolean;
}

@Injectable()
export class HelpService {

    /**
     * The logger instance
     */
    private readonly logger = new Logger(HelpService.name);

    constructor(
        private readonly discordService: DiscordService,
    ) {
        this.getBotCommands();
    }

    public async handleHelpCommand(interaction: ChatInputCommandInteraction<CacheType>) {
        interaction.reply({
            content: 'Pobieram listę dostępnych komend na serwerze...',
            ephemeral: true,
        });

        const menuPageButton = (currentMenu) => {
            return new Row([
                new MenuOption(
                    {
                        label: "Członkowie w drużynach",
                        description: "Członkowie którzy należą do dowolnej drużyny PLA Inside",
                        value: "teamMembers",
                        default: currentMenu == 'insideTeamMembers',
                        emoji: "👥",
                    },
                    'insideTeamMembers'
                ),
                new MenuOption(
                    {
                        label: "Drużyny PLA Inside",
                        description: "Członkowie konkretnych drużyn PLA Inside",
                        value: "teams",
                        default: currentMenu == 'insideTeams',
                        // emoji: plaInsideEmoji,
                        emoji: '🤺'
                    },
                    'insideTeams'
                ),
                new MenuOption(
                    {
                        label: "Członkowie w rezerwie",
                        description: "Członkowie którzy należą do rezerwy PLA Inside",
                        value: "reserves",
                        default: currentMenu == 'insideReserveMembers',
                        emoji: "👤",
                    },
                    'insideReserveMembers'
                ),
                new MenuOption(
                    {
                        label: "Członkowie bez drużyny i poza rezerwą",
                        description: "Członkowie którzy nie należą do żadnej drużyny i nie są w rezerwie",
                        value: "others",
                        default: currentMenu == 'insideWithoutMembers',
                        emoji: "👽",
                    },
                    'insideWithoutMembers'
                ),
            ], RowTypes.SelectMenu)
        };
        
    }

    private async getBotCommands() {
        const discordCommands = await this.discordService.getApplicationCommands();
        const commands = [];

        // for (const command of discordCommands.values()) {
        //     const options = command.options;
        //     let subCommands = [];

        //     if (typeof command.options !== 'undefined') {
        //         for (const option of options) {
        //             const iOption: ICommandOption = {
        //                 name: option.name,
        //                 description: option.description,
        //                 type: option.type,
        //             };

        //             if (option.type !== ApplicationCommandOptionType.Subcommand &&
        //                 option.type !== ApplicationCommandOptionType.SubcommandGroup
        //             ) {
        //                 commands.push();

        //                 continue;
        //             }

        //             const iSubCommand = this.createICommand(option);


        //         }

        //         iCommand.options = subCommands;
        //     }
        // }


    }

    // private async createICommand(command): Promise<ICommand> {
    //     const iCommand: ICommand = {
    //         name: command.name,
    //         description: command.description,
    //     }        

    //     return iCommand;
    // }
}
