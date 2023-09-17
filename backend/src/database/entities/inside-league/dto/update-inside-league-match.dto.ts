import { PartialType } from '@nestjs/mapped-types';
import { CreateInsideLeagueMatchDto } from './create-inside-league-match.dto';

export class UpdateInsideLeagueMatchDto extends PartialType(CreateInsideLeagueMatchDto) {}
