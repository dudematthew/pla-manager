import { Module, forwardRef } from '@nestjs/common';
import { ApexSeasonService } from './apex-season.service';
import { ApexApiModule } from 'src/apex-api/apex-api.module';
import { DiscordModule } from 'src/discord/discord.module';
import { ApexSeasonEntity } from './entities/apex-season.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CronModule } from 'src/cron/cron.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApexSeasonEntity]),
    ApexApiModule,  
    forwardRef(() => DiscordModule),
    forwardRef(() => CronModule),
  ],
  providers: [
    ApexSeasonService,
  ],
  exports: [ApexSeasonService],
})
export class ApexSeasonModule {}
