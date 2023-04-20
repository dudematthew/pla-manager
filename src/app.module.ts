import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DiscordModule } from './discord/discord.module';
import { LoggerModule } from './logger/logger.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';


@Module({
  imports: [
    DiscordModule,
    LoggerModule,
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
  ],
  controllers: [
    AppController,
  ],
  providers: [
    AppService,
  ],
})
export class AppModule {}
