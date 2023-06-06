import { Module, forwardRef } from "@nestjs/common";
import { NecordModule } from 'necord';
import { IntentsBitField, Partials } from 'discord.js';
import { DiscordUpdate } from './discord.update';
import { CommandsModule } from './commands/commands.module';
import { DiscordService } from "./discord.service";
import { RoleModule } from "src/database/entities/role/role.module";
import { LfgModule } from './lfg/lfg.module';
import DiscordListeners from "./discord.listeners";
import { LfgService } from "./lfg/lfg.service";
import { ChannelModule } from "src/database/entities/channel/channel.module";
import { ApexConnectModule } from './apex-connect/apex-connect.module';
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
                IntentsBitField.Flags.DirectMessages,
                IntentsBitField.Flags.DirectMessageReactions,
            ],
            partials: [
                Partials.Channel,
                Partials.Message,
            ]
        }),
        CommandsModule,
        RoleModule,
        LfgModule,
        ApexConnectModule,
        ChannelModule,
        InsideModule,
        RoleGroupModule
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
