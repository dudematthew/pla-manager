import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "discord.js";
import { UserEntity } from "src/user/user.entity";
import { UserModule } from "src/user/user.module";

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'mysql',
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT),
            username: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
            entities: [UserEntity],
            synchronize: true,
        }),
        UserModule
    ],
})
export class DatabaseModule {}