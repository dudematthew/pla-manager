import { Inject, Injectable, Logger, forwardRef } from "@nestjs/common";
import { Cron, SchedulerRegistry } from "@nestjs/schedule";
import { DatabaseService } from "src/database/database.service";
import { ApexSyncService } from "src/discord/apex-connect/apex-sync.service";
import { DiscordService } from "src/discord/discord.service";

@Injectable()
export class CronService {

    private readonly logger = new Logger(CronService.name);

    constructor (
        private readonly databaseService: DatabaseService,
        @Inject(forwardRef(() => ApexSyncService))
        private readonly apexSyncService: ApexSyncService,
        private readonly schedulerRegistry: SchedulerRegistry,
    ) {
        this.init();
    }

    private async init () {
        this.logger.log('CronService initialized');
    }

    public getCronJob (name: string) {
        return this.schedulerRegistry.getCronJob(name);
    }

    // Schedule a cron job to run every hour
    // TODO: Change this to run every 6 hours
    @Cron('0 0 * * * *', {
        name: 'updateConnectedRoles',
    }) // At 00:00:00am every day
    public async updateConnectedRoles () {
        this.logger.log('updateConnectedRoles started working...');

        await this.apexSyncService.updateConnectedRoles();
    }

    // Schedule a cron job to run every 24 hours
    @Cron('0 0 0 * * *', {
        name: 'updateConnectedChannels',
    }) // At 00:00:00am every day
    public async backupDatabase () {
        this.logger.log('backupDatabase started working...');

        this.databaseService.backupDatabase();
    }

    // Schedule a cron job to run every 12 hours
    @Cron('0 0 */12 * * *', {
        name: 'updateConnectedAccounts',
    }) // At 00:00:00am every day
    public async updateConnectedAccounts () {
        this.logger.log('updateConnectedAccounts started working...');

        await this.apexSyncService.updateConnectedAccounts();
    }
}