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
          token: 'ODA5NDM0MTc0MjA1MDY3MzE0.GfMAxu.ubl2FFf1ztO9ji0NwEVhkh5pUejP5vj5Xs240Y',
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
