import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApexApiService } from "src/apex-api/apex-api.service";
import { Logger } from '@nestjs/common';
import { ApexAccountService } from "src/database/entities/apex-account/apex-account.service";
import { DiscordService } from "../discord.service";
import { UserService } from "src/database/entities/user/user.service";
import { CacheType, ChatInputCommandInteraction } from "discord.js";
import { MessageProviderService } from "./message-provider.service";

@Injectable()
export class ApexDisconnectService {

    private readonly logger = new Logger(ApexDisconnectService.name);

    constructor(
        private readonly apexApiService: ApexApiService,
        private readonly configService: ConfigService,
        private readonly apexAccountService: ApexAccountService,
        private readonly userService: UserService,
        private readonly discordService: DiscordService,
        private readonly messageProviderService: MessageProviderService,
    ) {}

    public async handleDisconnectCommand(interaction: ChatInputCommandInteraction<CacheType>) {

        // Check if player is connected to any account
        const discordId = interaction.user.id;
        const user = await this.userService.findByDiscordId(discordId);

        if (!user?.apexAccount) {
            interaction.reply({ content: 'Nie posiadasz powiązanego konta na naszym serwerze. Użyj komendy `/połącz` aby połączyć swoje konto Apex Legends z kontem Discord.', ephemeral: true});
            return;
        }

        const confirmResponse = await interaction.reply(this.messageProviderService.getDisconnectConfirmMessage(user.apexAccount));

        const collectorFilter = i => i.user.id == interaction.user.id;

        let confirmation: any;

        try {
            confirmation = await confirmResponse.awaitMessageComponent({ filter: collectorFilter, time: 60000 });
        } catch (e) {
            await interaction.editReply(this.messageProviderService.getPlayerDataExpiredMessage());
            return;
        }

        // Disconnect player from account
        await this.apexAccountService.remove(user.apexAccount.id);

        // Send confirmation message
        interaction.editReply(this.messageProviderService.getDisconnectSuccessMessage(user.apexAccount));
    }
}