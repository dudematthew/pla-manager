import { Module } from '@nestjs/common';
import { InsideService } from './inside.service';
import { RoleModule } from 'src/database/entities/role/role.module';
import { DiscordModule } from '../discord.module';
import { forwardRef } from '@nestjs/common';
import { EmojiModule } from 'src/database/entities/emoji/emoji.module';
import { manageMembersService } from './manage-members.service';

@Module({
  imports: [
    RoleModule,
    forwardRef(() => DiscordModule),
    EmojiModule,
  ],
  providers: [
    InsideService,
    manageMembersService,
  ],
  exports: [
    InsideService,
    manageMembersService,
  ],
})
export class InsideModule {}
