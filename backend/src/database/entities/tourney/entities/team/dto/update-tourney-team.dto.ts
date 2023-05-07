import { PartialType } from '@nestjs/mapped-types';
import { CreateTeamDto } from './create-tourney-team.dto';

export class UpdateTeamDto extends PartialType(CreateTeamDto) {}
