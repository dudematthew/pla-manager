import { Module, forwardRef } from '@nestjs/common';
import { ApexStatisticsService } from './apex-statistics.service';
import { DiscordModule } from '../discord.module';
import { ApexAccountModule } from 'src/database/entities/apex-account/apex-account.module';
import { UserModule } from 'src/database/entities/user/user.module';
import { ApexApiModule } from 'src/apex-api/apex-api.module';

@Module({
  imports: [
    forwardRef(() => DiscordModule),
    ApexAccountModule,
    UserModule,
    ApexApiModule,
  ],
  providers: [ApexStatisticsService],
  exports: [ApexStatisticsService],
})
export class ApexStatisticsModule {}
