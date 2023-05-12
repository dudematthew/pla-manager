import { Module, forwardRef } from '@nestjs/common';
import { LfgService } from './lfg.service';
import { RoleModule } from 'src/database/entities/role/role.module';
import { RoleService } from 'src/database/entities/role/role.service';
import { DiscordService } from '../discord.service';
import { DiscordModule } from '../discord.module';
import { Repository } from 'typeorm';
import { RoleEntity } from 'src/database/entities/role/entities/role.entity';

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
