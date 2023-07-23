import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApexApiService } from 'src/apex-api/apex-api.service';
import { ApexAccountService } from 'src/database/entities/apex-account/apex-account.service';
import { UserService } from 'src/database/entities/user/user.service';
import { DiscordService } from '../discord.service';
import { handleStatisticsDiscordCommandDto } from '../commands/dtos/handle-statistics-discord-command.dto copy';
import { CacheType, ChatInputCommandInteraction } from 'discord.js';

@Injectable()
export class ApexStatisticsService {

    constructor(
        private readonly apexApiService: ApexApiService,
        private readonly configService: ConfigService,
        private readonly apexAccountService: ApexAccountService,
        private readonly userService: UserService,
        private readonly discordService: DiscordService,
    ) {}

    /**
     * Command that handles statistics for Discord user
     * @param Interaction 
     * @param options 
     */
    public async handleStatisticsDiscordCommand(Interaction: ChatInputCommandInteraction<CacheType>, options: handleStatisticsDiscordCommandDto) {
        Interaction.deferReply();
        
        // const user = await this.userService.findByDiscordId(options.user);

        Interaction.reply({
            content: `Statystyki dla użytkownika \`${options.user}\``,
        });
    }

}
