import { Injectable, Logger } from '@nestjs/common';
import { DiscordService } from '../discord.service';
import { ApplicationCommand, ApplicationCommandOptionData, ApplicationCommandOptionType, ApplicationCommandType, CacheType, ChatInputCommandInteraction } from 'discord.js';
import { MenuOption, Row, RowTypes } from 'discord.js-menu-buttons';

interface ICommandGroup {
    name: string;
    description: string;
    id: string;
    commands: ICommand[];
}

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

        const iCommands = await this.createICommandsGroups(discordCommands);

        console.log(iCommands);

        return iCommands;
    }

    private async createICommandsGroups(commands) : Promise<{ [key: string]: ICommand[] }> {
        const iCommandsGroups = {
            default: [],
        }

        for (const command of commands.values()) {
            // Check if command has options
            if (typeof command.options !== 'undefined' && command.options.length > 0) {
                
                    // Check if command has options
                    // (aLl options are either subcommand or just command option)
                    if (command.options[0].type === ApplicationCommandOptionType.Subcommand ||
                        command.options[0].type === ApplicationCommandOptionType.SubcommandGroup
                    ) {
                        iCommandsGroups[command.name] = await this.createICommandsGroup(command.options);
    
                        continue;
                    }
                    else {
                        iCommandsGroups['default'].push(await this.createICommand(command));
                    }
            } else
                iCommandsGroups['default'].push(await this.createICommand(command));
        }
        

        return iCommandsGroups;
    }

    /**
     * Create a group of commands
     * Accepts only subcommands and subcommand groups
     * @param commands 
     * @param commandsGroupName 
     */
    private async createICommandsGroup(commands): Promise<ICommand[]> {
        const iCommandGroup = [];

        for (const command of commands.values()) {
            iCommandGroup.push(await this.createICommand(command));
        }

        return iCommandGroup;
    }

    /**
     * Create ICommand from ApplicationCommand ONLY if it's NOT 
     * a subcommand or subcommand group
     * @param command 
     */
    private async createICommand(command): Promise<ICommand> {
        const iCommand: ICommand = {
            name: command.name,
            description: command.description,
        };

        if (typeof command.options !== 'undefined') {
            const options = [];

            for (const option of command.options) {
                const iOption: ICommandOption = {
                    name: option.name,
                    description: option.description,
                    type: option.type,
                };

                options.push(iOption);
            }

            iCommand.options = options;
        }

        return iCommand;
    }
}
