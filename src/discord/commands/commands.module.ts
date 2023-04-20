import { Module, Injectable } from '@nestjs/common';
import { CommandsService } from './commands.service';

@Module({
  imports: [],
  providers: [CommandsService],
  controllers: []
})
export class CommandsModule {}
