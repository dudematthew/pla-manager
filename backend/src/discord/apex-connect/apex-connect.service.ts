import { Injectable } from '@nestjs/common';
import { MessageData } from '../discord.listeners';
import { SlashCommandContext } from 'necord';
import { CacheType, ChatInputCommandInteraction } from 'discord.js';
import { handleConnectCommandDto, platformAliases } from '../commands/dtos/handle-connect.command.dto';
import { ApexApiService } from 'src/apex-api/apex-api.service';
import { Logger } from '@nestjs/common';
import { PlayerStatisticsParamsDto } from 'src/apex-api/dtos/player-statistics-params.dto';

@Injectable()
export class ApexConnectService {

    private logger = new Logger(ApexConnectService.name);

    constructor(
        private readonly apexApiService: ApexApiService,
    ) {}

    public async handleConnectCommand(interaction: ChatInputCommandInteraction<CacheType>, options: handleConnectCommandDto) {
        const playerData = await this.apexApiService.getPlayerStatisticsByName(options.username, options.platform);

        if (playerData?.errorCode === 404) {
            interaction.reply({ content: `Nie znaleziono gracza o nicku ${options.username} na platformie ${platformAliases[options.platform]}.`, ephemeral: true});
            return;
        }

        interaction.reply({ content: 'Ta funkcja jest jeszcze niezaimplementowana.', ephemeral: true});

        // interaction.reply({ content: `Hej! Widzę że próbujesz połączyć swoje konto ${options.username}! Zanim to się jednak stanie musisz potwierdzić, że konto należy do ciebie. Wysłałem ci prywatną wiadomość, w ramach procesu zaklepania twojego konta Apex.`, ephemeral: true});

        // interaction.user.send({ content: `Hej! Widzę że próbujesz połączyć swoje konto ${options.username}! Zanim to się jednak stanie musisz potwierdzić, że konto należy do ciebie. W tym celu musisz wysłać wiadomość na czacie w grze, zawierającą kod: ${options.code}. Po wysłaniu wiadomości, napisz mi na czacie prywatnym komendę \`/connect ${options.code}\` aby potwierdzić swoją tożsamość.`});
    }

    public async handlePrivateMessage(messageData: MessageData) {
        console.log("Received private message: ", messageData);
    }

}
