import { Module, forwardRef } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { CronService } from './cron.service';
import { ApexConnectModule } from 'src/discord/apex-connect/apex-connect.module';
import { DiscordModule } from 'src/discord/discord.module';

@Module({
    imports: [
        DatabaseModule,
        forwardRef(() => ApexConnectModule),
        forwardRef(() => DiscordModule),
    ],
    providers: [
        CronService,
    ],
    exports: [
        CronService,
    ]
})
export class CronModule {}
