import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DiscordModule } from './discord/discord.module';
import { LoggerModule } from './logger/logger.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { SessionSerializer } from './auth/session.serializer';
import { DiscordStrategy } from './auth/discord.strategy';
import { ChannelModule } from './channel/channel.module';
import { DiscordService } from './discord/discord.service';
import { TypeORMSession } from './database/entities/session.entity';
import { AdminPanelModule } from './admin-panel/admin-panel.module';

let envFilePath = '.env.development';
if (process.env.NODE_ENV === 'production') {
  envFilePath = '.env.production';
}

console.log("Running with env file:", envFilePath);

@Module({
  imports: [
    DiscordModule,
    LoggerModule,
    ConfigModule.forRoot({ 
      isGlobal: true,
      envFilePath: envFilePath,
     }),
    AuthModule,
    UserModule,
    ChannelModule,
    AdminPanelModule,
  ],
  controllers: [
    AppController,
  ],
  providers: [
    AppService,
    SessionSerializer,
    DiscordStrategy,
    DiscordService,
    TypeORMSession,
  ],
  exports: [
    SessionSerializer,
    AppService,
    DiscordService,
    TypeORMSession,
  ],
})
export class AppModule {}
