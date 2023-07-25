import { PartialType } from '@nestjs/mapped-types';
import { CreateApexAccountHistoryDto } from './create-apex-account-history.dto';

export class UpdateApexAccountHistoryDto extends PartialType(CreateApexAccountHistoryDto) {}
