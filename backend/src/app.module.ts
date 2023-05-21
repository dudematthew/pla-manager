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
import { ApexAccountModule } from './database/entities/apex-account/apex-account.module';
import { RoleModule } from './database/entities/role/role.module';
import { EmojiModule } from './database/entities/emoji/emoji.module';

@Module({
  imports: [
    ConfigModule,
    CacheModule.register({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../../../frontend/dist'),
      exclude: ['/api*', '/auth*', '/admin*'],
    }),
    DiscordModule,
    LoggerModule,
    AuthModule,
    ChannelModule,
    // AdminPanelModule,
    ApexApiModule,
    TourneyModule,
    ConfigModule,
    // Database Modules --
    DatabaseModule,
    ApexAccountModule,
    UserModule,
    RoleModule,
    EmojiModule,
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
