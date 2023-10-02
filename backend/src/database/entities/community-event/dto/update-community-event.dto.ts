import { PartialType } from '@nestjs/mapped-types';
import { CreateCommunityEventDto } from './create-community-event.dto';

export class UpdateCommunityEventDto extends PartialType(CreateCommunityEventDto) {}
