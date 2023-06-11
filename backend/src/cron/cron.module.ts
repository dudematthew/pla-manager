import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { DiscordModule } from 'src/discord/discord.module';
import { CronService } from './cron.service';
import { ApexConnectModule } from 'src/discord/apex-connect/apex-connect.module';

@Module({
    imports: [
        DiscordModule,
        DatabaseModule,
        ApexConnectModule,
    ],
    providers: [
        CronService,
    ],
})
export class CronModule {}
