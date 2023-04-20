import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { DiscordStrategy } from "./discord.strategy";
import { DiscordAuthController } from "./discord-auth.controller";


@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'discord' }),
    ],
    providers: [
        DiscordStrategy,
    ],
    controllers: [
        DiscordAuthController,
    ],
})
export class AuthModule {}