import { PartialType } from '@nestjs/mapped-types';
import { CreateApexAccountDto } from './create-apex-account.dto';

export class UpdateApexAccountDto extends PartialType(CreateApexAccountDto) {}
