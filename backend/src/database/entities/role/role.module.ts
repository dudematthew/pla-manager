import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleEntity } from './entities/role.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { forwardRef } from '@nestjs/common';
import { DiscordModule } from 'src/discord/discord.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoleEntity]),
    forwardRef(() => DiscordModule),
  ],
  providers: [
    RoleService,
  ],
  exports: [
    RoleService
  ],
})
export class RoleModule {}
