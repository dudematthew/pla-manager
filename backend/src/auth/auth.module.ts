import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { DiscordStrategy } from "./discord.strategy";
import { DiscordAuthController } from "./discord-auth.controller";
import { AuthService } from "./auth.service";
import { UserModule } from "src/database/entities/user/user.module";
import { DiscordModule } from "src/discord/discord.module";
import { DiscordAuthGuard } from "./guards/discord.guard";
import { SessionSerializer } from "./session.serializer";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "src/database/entities/user/user.entity";


@Module({
    imports: [
        PassportModule.register({ 
            defaultStrategy: 'discord',
            session: true,
        }),
        UserModule,
        DiscordModule,
        TypeOrmModule.forFeature([UserEntity]),
    ],
    providers: [
        AuthService,
        DiscordStrategy,
        DiscordAuthGuard,
        SessionSerializer,
    ],
    controllers: [
        DiscordAuthController,
    ],
    exports: [
        AuthService,
        PassportModule,
        DiscordAuthGuard,
        SessionSerializer,
    ]
})
export class AuthModule {}