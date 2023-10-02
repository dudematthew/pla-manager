import { Module } from '@nestjs/common';
import { GiveawayMemberService } from './giveaway-member.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GiveawayMemberEntity } from './entities/giveaway-member.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([GiveawayMemberEntity])
  ],
  providers: [GiveawayMemberService],
  exports: [GiveawayMemberService],
})
export class GiveawayMemberModule {}
