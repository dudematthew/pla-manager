import { Module } from '@nestjs/common';
import { InsideService } from './inside.service';
import { RoleModule } from 'src/database/entities/role/role.module';
import { DiscordModule } from '../discord.module';
import { forwardRef } from '@nestjs/common';

@Module({
  imports: [
    RoleModule,
    forwardRef(() => DiscordModule),
  ],
  providers: [
    InsideService,
  ],
  exports: [InsideService],
})
export class InsideModule {}
