import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './role.entity';
import { RoleService } from './role.service';

@Module({
  providers: [
    RoleService
  ],
  imports: [
    TypeOrmModule.forFeature([Role])
  ],
  exports: [
    RoleService
  ]
})
export class RoleModule {}
