import { Module } from '@nestjs/common';
import { RoleGroupService } from './role-group.service';
import { RoleGroupEntity } from './entities/role-group.entity';
import { DiscordModule } from 'src/discord/discord.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { forwardRef } from '@nestjs/common';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoleGroupEntity]),
    forwardRef(() => DiscordModule),
  ],
  providers: [
    RoleGroupService
  ],
  exports: [
    RoleGroupService
  ],
})
export class RoleGroupModule {}
