import { PartialType } from '@nestjs/mapped-types';
import { CreateRoleGroupDto } from './create-role-group.dto';

export class UpdateRoleGroupDto extends PartialType(CreateRoleGroupDto) {}
