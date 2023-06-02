import { Module } from '@nestjs/common';
import { ApexConnectService } from './apex-connect.service';
import { ApexApiModule } from 'src/apex-api/apex-api.module';
import { ApexAccountModule } from 'src/database/entities/apex-account/apex-account.module';
import { UserModule } from 'src/database/entities/user/user.module';
import { DiscordModule } from '../discord.module';
import { forwardRef } from '@nestjs/common';
import { ApexDisconnectService } from './apex-disconnect.service';
import { MessageProviderService } from './message-provider.service';

@Module({
  imports: [
    ApexApiModule,
    ApexAccountModule,
    UserModule,
    forwardRef(() => DiscordModule),
  ],
  providers: [
    ApexConnectService,
    ApexDisconnectService,
    MessageProviderService,
  ],
  exports: [
    ApexConnectService,
    ApexDisconnectService,
  ],
})
export class ApexConnectModule {}
