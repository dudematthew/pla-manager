import { Module } from '@nestjs/common';
import { CommunityEventService } from './community-event.service';
import { CommunityEventEntity } from './entities/community-event.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CommunityEventEntity]),
    UserModule
  ],
  providers: [
    CommunityEventService
  ],
  exports: [CommunityEventService],
})
export class CommunityEventModule {}
