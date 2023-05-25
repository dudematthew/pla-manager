import { Module, forwardRef } from "@nestjs/common";
import { NecordModule } from 'necord';
import { IntentsBitField } from 'discord.js';
import { DiscordUpdate } from './discord.update';
import { CommandsModule } from './commands/commands.module';
import { DiscordService } from "./discord.service";
import { RoleModule } from "src/database/entities/role/role.module";
import { LfgModule } from './lfg/lfg.module';
import DiscordListeners from "./discord.listeners";
import { LfgService } from "./lfg/lfg.service";
import { ChannelModule } from "src/database/entities/channel/channel.module";
import { DiscordStrategy } from "src/auth/discord.strategy";
import { InsideModule } from './inside/inside.module';

@Module({
    imports: [
        NecordModule.forRoot({
            token: process.env.DISCORD_TOKEN,
            intents: [
                IntentsBitField.Flags.Guilds,
                IntentsBitField.Flags.GuildMessages,
                IntentsBitField.Flags.GuildMessageReactions,
                IntentsBitField.Flags.GuildMembers,
                IntentsBitField.Flags.GuildVoiceStates,
                IntentsBitField.Flags.MessageContent,
            ],
        }),
        CommandsModule,
        RoleModule,
        LfgModule,
        ChannelModule,
        InsideModule,
    ],
    controllers: [],
    providers: [
        DiscordUpdate,
        DiscordService,
        DiscordListeners,
    ],
    exports: [
        DiscordService,
        DiscordUpdate,
    ]
})
export class DiscordModule {}
