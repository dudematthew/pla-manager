import { Module } from '@nestjs/common';
import { ApexAccountHistoryService } from './apex-account-history.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApexAccountHistoryEntity } from './entities/apex-account-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApexAccountHistoryEntity]),
  ],
  providers: [
    ApexAccountHistoryService
  ],
  exports: [
    ApexAccountHistoryService,
  ]
})
export class ApexAccountHistoryModule {}
