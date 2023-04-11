import { Module } from '@nestjs/common';
import { PingCommand } from './ping/ping.command';
import { AddUserCommand } from './add-user/add-user.command';
import { DiscordModule } from '@discord-nestjs/core';
import { UserModule } from 'src/user/user.module';
import { ListRolesCommand } from './list-roles/list-roles.command';

@Module({
    imports: [
        DiscordModule.forFeature(),
        UserModule,
    ],
    providers: [
        PingCommand,
        AddUserCommand,
        ListRolesCommand
    ],
})
export class CommandsModule {}
