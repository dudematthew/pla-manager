import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "src/user/user.entity";
import { TypeORMSession } from "./entities/session.entity";
import { ConfigModule, ConfigService} from "@nestjs/config";

@Module({
    imports: [
        ConfigModule,
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async(configService: ConfigService) => ({
                type: 'mysql',
                host: configService.get('DB_HOST', 'localhost'),
                port: parseInt(configService.get('DB_PORT', '3306')),
                username: configService.get('DB_USER', 'root'),
                password: configService.get('DB_PASS', ''),
                database: configService.get('DB_NAME', 'pla_manager'),
                entities: [UserEntity, TypeORMSession],
                synchronize: true,
            }),
            inject: [ConfigService]
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