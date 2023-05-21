import { Module, Injectable } from '@nestjs/common';
import { CommandsService } from './commands.service';
import { RoleModule } from 'src/database/entities/role/role.module';
import { InsideModule } from '../inside/inside.module';
import { EmojiModule } from 'src/database/entities/emoji/emoji.module';

@Module({
  imports: [
    RoleModule,
    InsideModule,
    EmojiModule,
  ],
  providers: [
    CommandsService,
  ],
})
export class CommandsModule {}
