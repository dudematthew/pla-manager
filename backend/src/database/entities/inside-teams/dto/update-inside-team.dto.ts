import { PartialType } from '@nestjs/mapped-types';
import { CreateInsideTeamDto } from './create-inside-team.dto';

export class UpdateInsideTeamDto extends PartialType(CreateInsideTeamDto) {}
