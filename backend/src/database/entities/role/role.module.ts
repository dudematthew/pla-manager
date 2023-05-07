import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { DiscordModule } from 'src/discord/discord.module';
import { DiscordService } from 'src/discord/discord.service';
import { RoleEntity } from './entities/role.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoleEntity]),
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
