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
import { RoleGroupModule } from "src/database/entities/role-group/role-group.module";
import { UserModule } from "src/database/entities/user/user.module";
import { TourneyModule } from "src/database/entities/tourney/tourney.module";
import { ApexAccountModule } from "src/database/entities/apex-account/apex-account.module";
import { DatabaseModule } from "src/database/database.module";
import { IntroduceModule } from './introduce/introduce.module';
import { ApexStatisticsModule } from './apex-statistics/apex-statistics.module';

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
                IntentsBitField.Flags.GuildIntegrations,
                IntentsBitField.Flags.GuildMessageTyping,
                IntentsBitField.Flags.GuildModeration,
            ],
            partials: [
                Partials.Channel,
                Partials.Message,
            ]
        }),
        
        RoleGroupModule,
        CommandsModule,
        RoleModule,
        LfgModule,
        ApexConnectModule,
        ChannelModule,
        InsideModule,
        UserModule,
        TourneyModule,
        ApexAccountModule,
        IntroduceModule,
        ApexStatisticsModule,
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
