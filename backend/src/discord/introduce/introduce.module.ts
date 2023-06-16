import { Module, forwardRef } from '@nestjs/common';
import { IntroduceService } from './introduce.service';
import { DiscordService } from '../discord.service';
import { DiscordModule } from '../discord.module';

@Module({
  imports: [
    forwardRef(() => DiscordModule),
  ],
  providers: [IntroduceService],
  exports: [IntroduceService]
})
export class IntroduceModule {}
