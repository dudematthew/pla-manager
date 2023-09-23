import { Module } from '@nestjs/common';
import { CommunityEventService } from './community-event.service';
import { CommunityEventEntity } from './entities/community-event.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([CommunityEventEntity]),
  ],
  providers: [
    CommunityEventService
  ],
  exports: [CommunityEventService],
})
export class CommunityEventModule {}
