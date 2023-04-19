import { Module } from "@nestjs/common";
import { NecordModule } from 'necord';
import { IntentsBitField } from 'discord.js';
import { AppUpdate } from './discord.update';

@Module({
    imports: [
        NecordModule.forRoot({
          token: 'ODA5NDM0MTc0MjA1MDY3MzE0.GfMAxu.ubl2FFf1ztO9ji0NwEVhkh5pUejP5vj5Xs240Y',
          intents: [IntentsBitField.Flags.Guilds]
        }),
    ],
    controllers: [],
    providers: [
        AppUpdate,
    ],
})
export class DiscordModule {}
