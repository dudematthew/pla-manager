import { PartialType } from '@nestjs/mapped-types';
import { CreateTourneyDto } from './create-tourney.dto';

export class UpdateTourneyDto extends PartialType(CreateTourneyDto) {}
