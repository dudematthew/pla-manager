import { Injectable, Logger, Query } from '@nestjs/common';
import { DiscordService } from '../discord.service';
import { ApplicationCommand, ApplicationCommandOptionData, ApplicationCommandOptionType, ApplicationCommandType, CacheType, ChatInputCommandInteraction } from 'discord.js';
import { Menu, MenuOption, Row, RowTypes } from 'discord.js-menu-buttons';

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
    ) {}

    public async handleHelpCommand(interaction: ChatInputCommandInteraction<CacheType>) {
        interaction.reply({
            content: 'Pobieram listę dostępnych komend na serwerze...',
            ephemeral: true,
        });

        const iCommandsGroups = await this.getICommandsGroups();

        console.log(iCommandsGroups);

        // Create global page numbers
        const pageNumbers: { [id: string]: number } = {
            default: 0,
        }

        // Add page numbers for each group
        Object.values(iCommandsGroups).map((iCommandsGroup) => {
            pageNumbers[iCommandsGroup.id] = 0;
        });

        // Create menu options (buttons)
        const menuPageButton = (currentMenu) => {
            const menuOptions = [];

            for (const iCommandsGroup of Object.values(iCommandsGroups)) {
                const menuOption = new MenuOption(
                    {
                        label:  iCommandsGroup.name,
                        description: iCommandsGroup.description,
                        value: iCommandsGroup.id,
                        default: currentMenu == iCommandsGroup.id,
                        emoji: {
                            name: '📜',
                        },
                    },
                    currentMenu
                );

                menuOptions.push(menuOption);
            }

            return new Row(menuOptions, RowTypes.SelectMenu)
        };

        const createPageButtons = (currentMenu, embed) => {
            const buttons = [];

            if (pageNumbers[currentMenu] > 0) {
                buttons.push({
                    name: 'previous',
                    emoji: {
                        name: '◀️',
                    },
                    style: 'SECONDARY',
                    customId: 'previous',
                });
            }

            if (pageNumbers[currentMenu] < Math.ceil(iCommandsGroups[currentMenu].commands.length / 5) - 1) {
                buttons.push({
                    name: 'next',
                    emoji: {
                        name: '▶️',
                    },
                    style: 'SECONDARY',
                    customId: 'next',
                });
            }

            return buttons;
        }

        const menu = new Menu(interaction.channel, interaction.user.id, (() => {
            const menuPages = [];

            for (const iCommandsGroup of Object.values(iCommandsGroups)) {
                const menuPage = {
                    name: iCommandsGroup.name,
                    content: () => {
                        return this.getCommandsGroupEmbed(iCommandsGroup, pageNumbers[iCommandsGroup.id]);
                    },
                    rows: (() => { 
                        const rows = [
                            menuPageButton(iCommandsGroup.id),
                        ];
    
                        // Add page buttons if there is more than one page
                        // if (iCommandsGroups['default'].commands.length > 5)
                        //     rows.push(
                        //         new Row(
                        //             createPageButtons('default', iCommandsGroups['default'].commands), 
                        //             RowTypes.ButtonMenu
                        //         )
                        //     );
                        return rows;
                    })()
                }

                menuPages.push(menuPage);
            }

            return menuPages;
        })());

        await menu.start();
        
    }

    private getCommandsGroupEmbed(iCommandsGroup: ICommandGroup, page: number) {
        const embed = {
            title: `Komendy: ${iCommandsGroup.name}`,
            description: iCommandsGroup.description,
            fields: [],
        };

        console.log(iCommandsGroup, page);
        
        // const commands = iCommandsGroup.commands;

        // const commandsPerPage = 5;
        // const pages = Math.ceil(commands.length / commandsPerPage);

        // const start = page * commandsPerPage;
        // const end = start + commandsPerPage;

        // for (const command of commands.slice(start, end)) {
        //     let commandString = `**/${command.name}**`;

        //     if (typeof command.options !== 'undefined') {
        //         commandString += ' ';

        //         for (const option of command.options) {
        //             commandString += `**${option.name}** `;
        //         }
        //     }

        //     embed.fields.push({
        //         name: commandString,
        //         value: command.description,
        //     });
        // }

        console.log(embed);

        return embed;
    }

    private async getICommandsGroups(): Promise<{ [id: string]: ICommandGroup }> {
        const commands = await this.discordService.getApplicationCommands();

        const defaultCommandsGroup: ICommandGroup = {
            name: 'Podstawowe',
            id: 'default',
            description: 'Podstawowe komendy bota',
            commands: [],
        }

        const iCommandsGroups = {
            default: defaultCommandsGroup,
        }

        for (const command of commands.values()) {
            // Check if command has options
            if (typeof command.options !== 'undefined' && command.options.length > 0) {
                
                    // Check if command has options
                    // (aLl options are either subcommand or just command option)
                    if (command.options[0].type === ApplicationCommandOptionType.Subcommand ||
                        command.options[0].type === ApplicationCommandOptionType.SubcommandGroup
                    ) {
                        iCommandsGroups[command.name] = await this.createICommandsGroup(command.options, command.name, command.id, command.description);
    
                        continue;
                    }
                    else {
                        iCommandsGroups['default'].commands.push(await this.createICommand(command));
                    }
            } else
                iCommandsGroups['default'].commands.push(await this.createICommand(command));
        }
        

        return iCommandsGroups;
    }

    /**
     * Create a group of commands
     * Accepts only subcommands and subcommand groups
     * @param commands 
     * @param commandsGroupName 
     */
    private async createICommandsGroup(commands, name: string, id: string, description: string): Promise<ICommandGroup> {
        const iCommandGroup: ICommandGroup = {
            name: name,
            description: description,
            id: id,
            commands: [],
        };

        for (const command of commands.values()) {
            iCommandGroup.commands.push(await this.createICommand(command));
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
