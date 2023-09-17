import { PartialType } from '@nestjs/mapped-types';
import { CreateInsideLeagueSeasonDto } from './create-inside-league-season.dto';

export class UpdateInsideLeagueSeasonDto extends PartialType(CreateInsideLeagueSeasonDto) {}
