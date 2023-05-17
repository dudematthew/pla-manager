import { Module } from '@nestjs/common';
import { ApexConnectService } from './apex-connect.service';

@Module({
  providers: [
    ApexConnectService,
  ],
  exports: [
    ApexConnectService,
  ],
})
export class ApexConnectModule {}
