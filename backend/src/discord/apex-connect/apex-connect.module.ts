import { Module } from '@nestjs/common';
import { ApexConnectService } from './apex-connect.service';
import { ApexApiModule } from 'src/apex-api/apex-api.module';
import { ApexAccountModule } from 'src/database/entities/apex-account/apex-account.module';
import { UserModule } from 'src/database/entities/user/user.module';

@Module({
  imports: [
    ApexApiModule,
    ApexAccountModule,
    UserModule,
  ],
  providers: [
    ApexConnectService,
  ],
  exports: [
    ApexConnectService,
  ],
})
export class ApexConnectModule {}
