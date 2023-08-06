import { PartialType } from '@nestjs/mapped-types';
import { CreateApexSeasonDto } from './create-apex-season.dto';

export class UpdateApexSeasonDto extends PartialType(CreateApexSeasonDto) {}
