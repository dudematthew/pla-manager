import { Module, Injectable, forwardRef } from '@nestjs/common';
import { CommandsService } from './commands.service';
import { RoleModule } from 'src/database/entities/role/role.module';
import { ApexConnectModule } from '../apex-connect/apex-connect.module';
import { InsideModule } from '../inside/inside.module';
import { EmojiModule } from 'src/database/entities/emoji/emoji.module';
import { AdminCommandsService } from './admin-commands.service';
import { InsideCommandsService } from './inside-commands.service';
import { DiscordModule } from '../discord.module';
import { RoleGroupModule } from 'src/database/entities/role-group/role-group.module';

@Module({
  imports: [
    RoleModule,
    ApexConnectModule,
    InsideModule,
    EmojiModule,
    forwardRef(() => DiscordModule),
  ],
  providers: [
    CommandsService,
    AdminCommandsService,
    InsideCommandsService,
  ],
})
export class CommandsModule {}
