import { Module, Injectable } from '@nestjs/common';
import { CommandsService } from './commands.service';
import { RoleModule } from 'src/database/entities/role/role.module';
import { ApexConnectModule } from '../apex-connect/apex-connect.module';
import { InsideModule } from '../inside/inside.module';
import { EmojiModule } from 'src/database/entities/emoji/emoji.module';
import { AdminCommandsService } from './admin-commands.service';

@Module({
  imports: [
    RoleModule,
    ApexConnectModule,
    InsideModule,
    EmojiModule,
  ],
  providers: [
    CommandsService,
    AdminCommandsService,
  ],
})
export class CommandsModule {}
