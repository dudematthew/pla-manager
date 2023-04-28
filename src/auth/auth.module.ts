import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { DiscordStrategy } from "./discord.strategy";
import { DiscordAuthController } from "./discord-auth.controller";
import { AuthService } from "./auth.service";
import { UserModule } from "src/user/user.module";
import { DiscordModule } from "src/discord/discord.module";
import { UserSerializer } from "./user.serializer";


@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'discord' }),
        UserModule,
        DiscordModule,
    ],
    providers: [
        AuthService,
        DiscordStrategy,
        UserSerializer,
    ],
    controllers: [
        DiscordAuthController,
    ],
    exports: [
        AuthService,
        PassportModule,
        UserSerializer,
    ]
})
export class AuthModule {}