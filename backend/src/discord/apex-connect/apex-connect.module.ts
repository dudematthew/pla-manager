import { Module } from '@nestjs/common';
import { ApexConnectService } from './apex-connect.service';
import { ApexApiModule } from 'src/apex-api/apex-api.module';

@Module({
  imports: [
    ApexApiModule,
  ],
  providers: [
    ApexConnectService,
  ],
  exports: [
    ApexConnectService,
  ],
})
export class ApexConnectModule {}
