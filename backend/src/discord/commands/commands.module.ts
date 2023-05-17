import { Module, Injectable } from '@nestjs/common';
import { CommandsService } from './commands.service';
import { RoleModule } from 'src/database/entities/role/role.module';
import { ApexConnectModule } from '../apex-connect/apex-connect.module';

@Module({
  imports: [
    RoleModule,
    ApexConnectModule,
  ],
  providers: [
    CommandsService,
  ],
})
export class CommandsModule {}
