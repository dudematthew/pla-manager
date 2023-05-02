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
let ignoreEnvFile = false;
if (process.env.NODE_ENV === 'production') {
  // Check if .env.production exists
  const fs = require('fs');
  if (fs.existsSync('.env.production')) {
    console.log('Using .env.production file');
    envFilePath = '.env.production';
  }
  else {
    console.log('No .env.production file found, using injected environment variables');
    ignoreEnvFile = true;
  }
} else {
  console.log('Using .env.development file');
}

@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true,
      envFilePath,
      ignoreEnvFile,
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
