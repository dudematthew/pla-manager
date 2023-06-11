import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { DatabaseService } from "src/database/database.service";
import { ApexSyncService } from "src/discord/apex-connect/apex-sync.service";
import { DiscordService } from "src/discord/discord.service";

@Injectable()
export class CronService {

    private readonly logger = new Logger(CronService.name);

    constructor (
        private readonly discordService: DiscordService,
        private readonly databaseService: DatabaseService,
        private readonly apexSyncService: ApexSyncService,
    ) {
        this.init();
    }

    private async init () {
        this.logger.log('CronService initialized');
    }

    // Schedule a cron job to run every hour
    // TODO: Change this to run every 6 hours
    @Cron('0 0 * * * *')
    public async updateConnectedAccounts () {
        this.logger.log('updateConnectedRoles started working...');

        await this.apexSyncService.updateConnectedAccounts();
    }

    // Schedule a cron job to run every 24 hours
    @Cron('0 0 0 * * *') // At 00:00:00am every day
    public async backupDatabase () {
        this.logger.log('backupDatabase started working...');

        this.databaseService.backupDatabase();
    }
}