import { Module, forwardRef } from '@nestjs/common';
import { HelpService } from './help.service';
import { DiscordModule } from '../discord.module';

@Module({
  imports: [
    forwardRef(() => DiscordModule),
  ],
  providers: [HelpService],
  exports: [HelpService],
})
export class HelpModule {}
