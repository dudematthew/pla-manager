import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DiscordModule } from './discord/discord.module';
import { LoggerModule } from './logger/logger.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './database/entities/user/user.module';
import { SessionSerializer } from './auth/session.serializer';
import { DiscordStrategy } from './auth/discord.strategy';
import { ChannelModule } from './database/entities/channel/channel.module';
import { TypeORMSession } from './database/entities/session.entity';
import { DatabaseModule } from './database/database.module';
import { join } from 'path';
// import { AdminPanelModule } from './admin-panel/admin-panel.module';
import { ApexApiModule } from './apex-api/apex-api.module';
import { TourneyModule } from './database/entities/tourney/tourney.module';
import { ConfigModule } from './config/config.module';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { CronModule } from './cron/cron.module';
import { HealthModule } from './health/health.module';
import { CommandsModule } from './discord/commands/commands.module';
import { RoleModule } from './database/entities/role/role.module';
import { LfgModule } from './discord/lfg/lfg.module';
import { ApexConnectModule } from './discord/apex-connect/apex-connect.module';
import { InsideModule } from './discord/inside/inside.module';
import { RoleGroupModule } from './database/entities/role-group/role-group.module';
import { MessageEntity } from './database/entities/message/entities/message.entity';

@Module({
  imports: [
    ConfigModule, // Config that uses yaml
    CacheModule.register({
      isGlobal: true,
    }), // Cache manager
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../../../frontend/dist'),
      exclude: ['/api*', '/auth*', '/admin*', '/health*'],
    }), // Serve the frontend
    ScheduleModule.forRoot(), // Module that powers the cron jobs
    DatabaseModule, // Everything related to the database
    DiscordModule, // Discord bot
    LoggerModule, // Logger
    AuthModule, // Authentication endpoints and strategies
    // AdminPanelModule, // Old admin panel
    ApexApiModule, // Everything related to the Apex API
    CronModule, // Cron jobs
    HealthModule, // Health check
    ApexConnectModule, // Apex connect command related stuff

    // Entities and their modules --
    CommandsModule,
    RoleModule,
    LfgModule,
    ChannelModule,
    InsideModule,
    RoleGroupModule,
    UserModule,
    TourneyModule,
    MessageEntity,
  ],
  controllers: [
    AppController,
  ],
  providers: [
    AppService,
    SessionSerializer,
    TypeORMSession,
  ],
})
export class AppModule {}
