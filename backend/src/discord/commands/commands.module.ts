import { Module, Injectable } from '@nestjs/common';
import { CommandsService } from './commands.service';
import { RoleModule } from 'src/database/entities/role/role.module';

@Module({
  imports: [
    RoleModule
  ],
  providers: [
    CommandsService,
  ],
})
export class CommandsModule {}
