import { Module, forwardRef } from '@nestjs/common';
import { ApexStatisticsService } from './apex-statistics.service';
import { DiscordModule } from '../discord.module';
import { ApexAccountModule } from 'src/database/entities/apex-account/apex-account.module';
import { UserModule } from 'src/database/entities/user/user.module';
import { ApexApiModule } from 'src/apex-api/apex-api.module';
import { EmojiModule } from 'src/database/entities/emoji/emoji.module';
import { ApexLeaderboardService } from './apex-leaderboard.service';
import { HtmlApiModule } from 'src/html-api/html-api.module';
import { ApexAccountHistoryModule } from 'src/database/entities/apex-account-history/apex-account-history.module';

@Module({
  imports: [
    forwardRef(() => DiscordModule),
    ApexAccountModule,
    UserModule,
    ApexApiModule,
    EmojiModule,
    HtmlApiModule,
    ApexAccountHistoryModule,
  ],
  providers: [
    ApexStatisticsService,
    ApexLeaderboardService,
  ],
  exports: [
    ApexStatisticsService,
    ApexLeaderboardService,
  ],
})
export class ApexStatisticsModule {}
