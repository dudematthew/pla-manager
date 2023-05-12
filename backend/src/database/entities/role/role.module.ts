import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { DiscordModule } from 'src/discord/discord.module';
import { DiscordService } from 'src/discord/discord.service';
import { RoleEntity } from './entities/role.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { forwardRef } from '@nestjs/common';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoleEntity]),
    forwardRef(() => DiscordModule),
  ],
  providers: [
    RoleService,
    DiscordService,
  ],
  exports: [
    RoleService
  ],
})
export class RoleModule {}
