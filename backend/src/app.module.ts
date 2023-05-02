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
import { DatabaseModule } from './database/database.module';

let envFilePath = '.env.development';
if (process.env.NODE_ENV === 'prod') {
  envFilePath = '.env.production';
}

console.log(`Running app in ${process.env.NODE_ENV} with env file:`, envFilePath);

@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true,
      envFilePath: '.env.production',
    }),
    DatabaseModule,
    DiscordModule,
    LoggerModule,
    AuthModule,
    UserModule,
    ChannelModule,
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
