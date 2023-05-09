import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "src/database/entities/user/user.entity";
import { TypeORMSession } from "./entities/session.entity";
import { ConfigModule, ConfigService} from "@nestjs/config";
import { ChannelEntity } from "src/database/entities/channel/channel.entity";
import { TourneyEntity } from "./entities/tourney/entities/tourney.entity";
import { TourneyTeamEntity } from "./entities/tourney/entities/team/entities/tourney-team.entity";
import { UserModule } from "./entities/user/user.module";
import { ChannelModule } from "./entities/channel/channel.module";
import { TourneyModule } from "./entities/tourney/tourney.module";
import { RoleModule } from './entities/role/role.module';
import { RoleEntity } from "./entities/role/entities/role.entity";

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
                entities: [
                    UserEntity,
                    ChannelEntity,
                    RoleEntity,
                    TypeORMSession,
                    TourneyEntity,
                    TourneyTeamEntity,
                ],
                synchronize: true,
            }),
            inject: [ConfigService]
        }),
        TypeOrmModule.forFeature([TypeORMSession]),
        RoleModule,
    ],
    providers: [
        TypeORMSession,
    ],
    exports: [
        TypeORMSession,
    ],
})
export class DatabaseModule {}