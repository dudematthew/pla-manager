import { Module, forwardRef } from '@nestjs/common';
import { LfgService } from './lfg.service';
import { RoleModule } from 'src/database/entities/role/role.module';
import { RoleService } from 'src/database/entities/role/role.service';
import { DiscordService } from '../discord.service';
import { DiscordModule } from '../discord.module';

@Module({
  imports: [
    RoleModule,
    forwardRef(() => DiscordModule),
  ],
  providers: [
    LfgService,
    RoleService,
    DiscordService,
  ],
})
export class LfgModule {}
