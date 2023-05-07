import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
import { DiscordService } from './discord/discord.service';
import { TypeORMSession } from './database/entities/session.entity';
import { DatabaseModule } from './database/database.module';
import { join } from 'path';
// import { AdminPanelModule } from './admin-panel/admin-panel.module';
import { ApexApiModule } from './apex-api/apex-api.module';
import { TourneyModule } from './database/entities/tourney/tourney.module';

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
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../../frontend/dist'),
      exclude: ['/api*', '/auth*', '/admin*'],
    }),
    DatabaseModule,
    DiscordModule,
    LoggerModule,
    AuthModule,
    UserModule,
    ChannelModule,
    // AdminPanelModule,
    // ApexApiModule,
    TourneyModule,
  ],
  controllers: [
    AppController,
  ],
  providers: [
    AppService,
    SessionSerializer,
    DiscordStrategy,
    TypeORMSession,
  ],
})
export class AppModule {}
