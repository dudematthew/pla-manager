import { Module } from "@nestjs/common";
import { UserEntity } from "./user.entity";
import { UserService } from "./user.service";
import { DiscordModule } from "src/discord/discord.module";
import { DatabaseModule } from "src/database/database.module";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
    providers: [
        UserService,
    ],
    exports: [
        UserService,
    ],
    imports: [
        DiscordModule,
        DatabaseModule,
        TypeOrmModule.forFeature([UserEntity]),
    ],
})
export class UserModule {}