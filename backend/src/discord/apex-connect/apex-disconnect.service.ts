import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApexApiService } from "src/apex-api/apex-api.service";
import { Logger } from '@nestjs/common';
import { ApexAccountService } from "src/database/entities/apex-account/apex-account.service";
import { DiscordService } from "../discord.service";
import { UserService } from "src/database/entities/user/user.service";
import { CacheType, ChatInputCommandInteraction } from "discord.js";

@Injectable()
export class ApexDisconnectService {

    private readonly logger = new Logger(ApexDisconnectService.name);

    constructor(
        private readonly apexApiService: ApexApiService,
        private readonly configService: ConfigService,
        private readonly apexAccountService: ApexAccountService,
        private readonly userService: UserService,
        private readonly discordService: DiscordService,
    ) {}

    public async handleDisconnectCommand(interaction: ChatInputCommandInteraction<CacheType>) {
        interaction.deferReply({ ephemeral: true });
    }
}