import { Module } from "@nestjs/common";
import { NecordModule } from 'necord';
import { IntentsBitField } from 'discord.js';
import { DiscordUpdate } from './discord.update';
import { CommandsModule } from './commands/commands.module';
import { DiscordService } from "./discord.service";
import { RoleModule } from "src/database/entities/role/role.module";

@Module({
    imports: [CommandsModule,
        NecordModule.forRoot({
            token: process.env.DISCORD_CLIENT_SECRET,
            intents: [IntentsBitField.Flags.Guilds]
        }),
        CommandsModule,
        RoleModule,
    ],
    controllers: [],
    providers: [
        DiscordUpdate,
        DiscordService
    ],
    exports: [
        DiscordService,
        DiscordUpdate,
        NecordModule,
        DiscordUpdate,
    ]
})
export class DiscordModule {}
