import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "src/user/user.entity";
import { TypeORMSession } from "./entities/session.entity";

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'mysql',
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT) || 3306,
            username: process.env.DB_USER || 'root',
            password: process.env.DB_PASS || '',
            database: process.env.DB_NAME || 'pla_manager',
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
export class DatabaseModule {}