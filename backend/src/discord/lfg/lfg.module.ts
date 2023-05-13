import { Module, forwardRef } from '@nestjs/common';
import { LfgService } from './lfg.service';
import { RoleModule } from 'src/database/entities/role/role.module';
import { DiscordModule } from '../discord.module';

@Module({
  imports: [
    RoleModule,
    forwardRef(() => DiscordModule),
  ],
  providers: [
    LfgService,
  ],
  exports: [
    LfgService,
  ]
})
export class LfgModule {}
