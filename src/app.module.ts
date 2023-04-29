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
  ],
  controllers: [
    AppController,
  ],
  providers: [
    AppService,
    SessionSerializer,
    DiscordStrategy,
  ],
  exports: [
    SessionSerializer,
  ],
})
export class AppModule {}
