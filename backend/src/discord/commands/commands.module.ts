import { Module, Injectable } from '@nestjs/common';
import { CommandsService } from './commands.service';
import { RoleModule } from 'src/database/entities/role/role.module';
import { InsideModule } from '../inside/inside.module';

@Module({
  imports: [
    RoleModule,
    InsideModule,
  ],
  providers: [
    CommandsService,
  ],
})
export class CommandsModule {}
