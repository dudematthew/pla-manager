import { Module } from '@nestjs/common';
import { CommunityEventService } from './community-event.service';
import { CommunityEventController } from './community-event.controller';

@Module({
  controllers: [CommunityEventController],
  providers: [CommunityEventService]
})
export class CommunityEventModule {}
