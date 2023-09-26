import { PartialType } from '@nestjs/mapped-types';
import { CreateGiveawayMemberDto } from './create-giveaway-member.dto';

export class UpdateGiveawayMemberDto extends PartialType(CreateGiveawayMemberDto) {}
