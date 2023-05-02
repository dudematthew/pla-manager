import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "src/user/user.entity";
import { TypeORMSession } from "./entities/session.entity";

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'mysql',
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT),
            username: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
            entities: [UserEntity, TypeORMSession],
            synchronize: true,
        }),
        TypeOrmModule.forFeature([TypeORMSession]),
    ],
    providers: [
        TypeORMSession,
    ],
    exports: [
        TypeORMSession,
    ],
})
export class DatabaseModule {

    constructor() {
        console.log(
            `DatabaseModule: ${process.env.DB_HOST} ${process.env.DB_PORT} ${process.env.DB_USER} ${process.env.DB_PASS} ${process.env.DB_NAME}`
        );
    }
}