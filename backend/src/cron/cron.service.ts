import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { DiscordService } from "src/discord/discord.service";

@Injectable()
export class CronService {

    private readonly logger = new Logger(CronService.name);

    constructor (
        private readonly discordService: DiscordService,
    ) {
        this.init();
    }

    private async init () {
        this.logger.log('CronService initialized');
    }

    // Schedule a cron job to run every hour
    // TODO: Change this to run every 6 hours
    // TODO: Make it update all roles regarding connected accounts
    @Cron('0 0 * * * *')
    public async updateDisconnectedRoles () {
        this.logger.log('updateDisconnectedRoles started working...');

        await this.discordService.updateDisconnectedRoles();
    }
}