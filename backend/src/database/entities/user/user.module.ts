import { Module } from "@nestjs/common";
import { UserEntity } from "./user.entity";
import { UserService } from "./user.service";
import { DiscordModule } from "src/discord/discord.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { forwardRef } from "@nestjs/common";
import { ApexAccountEntity } from "../apex-account/entities/apex-account.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([UserEntity, ApexAccountEntity]),
        forwardRef(() => DiscordModule),
    ],
    providers: [
        UserService,
    ],
    exports: [
        UserService,
    ],
})
export class UserModule {}