import { Inject, Injectable, Logger, forwardRef } from "@nestjs/common";
import { Cron, SchedulerRegistry } from "@nestjs/schedule";
import { CronJob } from "cron";
import { DatabaseService } from "src/database/database.service";
import { ApexSyncService } from "src/discord/apex-connect/apex-sync.service";
import { ApexLeaderboardService } from "src/discord/apex-statistics/apex-leaderboard.service";
import { DiscordService } from "src/discord/discord.service";
import { InsideLeaderboardService } from "src/discord/inside/inside-leaderboard.service";
import { teamsCompositionService } from "src/discord/inside/teams-composition.service";

@Injectable()
export class CronService {

    private readonly logger = new Logger(CronService.name);

    private readonly timeZone = 'Europe/Warsaw';

    constructor (
        private readonly databaseService: DatabaseService,
        @Inject(forwardRef(() => ApexSyncService))
        private readonly apexSyncService: ApexSyncService,
        private readonly schedulerRegistry: SchedulerRegistry,
        @Inject(forwardRef(() => ApexLeaderboardService))
        private readonly apexLeaderboardService: ApexLeaderboardService,
        private readonly teamsCompositionService: teamsCompositionService,
        private readonly insideLeaderboardService: InsideLeaderboardService,
    ) {
        this.init();
    }

    private async init () {
        this.logger.log('CronService initialized');
    }

    public getCronJob (name: string) {
        return this.schedulerRegistry.getCronJob(name);
    }

    public scheduleCronJob(
        name: string,
        cronExpression: string,
        callback: () => void
    ): CronJob {
        const cronJob = new CronJob(cronExpression, callback, undefined, undefined, this.timeZone);

        this.schedulerRegistry.addCronJob(name, cronJob);

        cronJob.start();

        this.logger.log(`Scheduled cron job '${name}' with expression '${cronExpression} to run at '${cronJob.nextDates()}'`);
        
        return cronJob;
    }
    

    // Schedule a cron job to run every hour
    // TODO: Change this to run every 6 hours
    @Cron('0 0 * * * *', {
        name: 'updateConnectedRoles',
        timeZone: 'Europe/Warsaw',
    }) // At 00:00:00am every day
    public async updateConnectedRoles () {
        this.logger.log('updateConnectedRoles started working...');

        await this.apexSyncService.updateConnectedRoles();
    }

    // Schedule a cron job to run every 24 hours
    @Cron('0 0 0 * * *', {
        name: 'updateConnectedChannels',
        timeZone: 'Europe/Warsaw',
    }) // At 00:00:00am every day
    public async backupDatabase () {
        this.logger.log('backupDatabase started working...');

        this.databaseService.backupDatabase();
    }

    // Schedule a cron job to run every 12 hours
    @Cron('0 0 0,12 * * *', {
        name: 'updateConnectedAccounts',
        timeZone: 'Europe/Warsaw',
    }) // At 00:00:00am every day
    public async updateConnectedAccounts () {
        this.logger.log('updateConnectedAccounts started working...');

        await this.apexSyncService.updateConnectedAccounts();

        // Update the inside team boards
        await this.teamsCompositionService.updateInsideTeamBoards();

        // Update the inside leaderboards
        ['lp-team', 'lp-member'].forEach(async (type) => {
            await this.insideLeaderboardService.updateInsideLeaderboards(type);
        });
    }
    // Schedule a cron job to run every 5 hours
    @Cron('0 0 */5 * * *', {
        name: 'updateLeaderboard',
        timeZone: 'Europe/Warsaw',
    })
    public async updateLeaderboard () {
        this.logger.log('updateLeaderboard started working...');

        await this.apexLeaderboardService.updateLeaderboard();
    }

}