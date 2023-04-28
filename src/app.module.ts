import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DiscordModule } from './discord/discord.module';
import { LoggerModule } from './logger/logger.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { UserSerializer } from './auth/user.serializer';
import { PassportModule } from '@nestjs/passport';
import { DiscordStrategy } from './auth/discord.strategy';


@Module({
  imports: [
    DiscordModule,
    LoggerModule,
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UserModule,
    PassportModule.register({ defaultStrategy: 'discord' }),
  ],
  controllers: [
    AppController,
  ],
  providers: [
    AppService,
    UserSerializer,
    DiscordStrategy,
  ],
  exports: [
    UserSerializer,
  ],
})
export class AppModule {}
