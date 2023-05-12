import { Module } from "@nestjs/common";
import { UserEntity } from "./user.entity";
import { UserService } from "./user.service";
import { DiscordModule } from "src/discord/discord.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { forwardRef } from "@nestjs/common";

@Module({
    imports: [
        forwardRef(() => DiscordModule),
        TypeOrmModule.forFeature([UserEntity]),
    ],
    providers: [
        UserService,
    ],
    exports: [
        UserService,
    ],
})
export class UserModule {}