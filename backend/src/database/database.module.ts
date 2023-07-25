import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "src/database/entities/user/user.entity";
import { TypeORMSession } from "./entities/session.entity";
import { ConfigModule, ConfigService} from "@nestjs/config";
import { ChannelEntity } from "src/database/entities/channel/channel.entity";
import { TourneyEntity } from "./entities/tourney/entities/tourney.entity";
import { TourneyTeamEntity } from "./entities/tourney/entities/team/entities/tourney-team.entity";
import { RoleEntity } from "./entities/role/entities/role.entity";
import { ApexAccountEntity } from "./entities/apex-account/entities/apex-account.entity";
import { EmojiModule } from './entities/emoji/emoji.module';
import { EmojiEntity } from "./entities/emoji/entities/emoji.entity";
import { RoleModule } from './entities/role/role.module';
import { ApexAccountModule } from './entities/apex-account/apex-account.module';
import { RoleGroupEntity } from "./entities/role-group/entities/role-group.entity";
import { RoleGroupModule } from "./entities/role-group/role-group.module";
import { DatabaseService } from "./database.service";
import { DiscordModule } from "src/discord/discord.module";
import { MessageModule } from './entities/message/message.module';
import { MessageEntity } from "./entities/message/entities/message.entity";
import { ApexAccountHistoryEntity } from "./entities/apex-account-history/entities/apex-account-history.entity";

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
                    RoleGroupEntity,
                    RoleEntity,
                    TypeORMSession,
                    TourneyEntity,
                    TourneyTeamEntity,
                    ApexAccountEntity,
                    ApexAccountHistoryEntity,
                    EmojiEntity,
                    MessageEntity,
                ],
                synchronize: true,
                autoLoadEntities: true,
            }),
            inject: [ConfigService]
        }),
        TypeOrmModule.forFeature([TypeORMSession]),
        forwardRef(() => DiscordModule),
    ],
    providers: [
        TypeORMSession,
        DatabaseService,
    ],
    exports: [
        TypeORMSession,
        DatabaseService,
    ],
})
export class DatabaseModule {}