import { Module } from '@nestjs/common';
import { ApexAccountService } from './apex-account.service';
import { ApexAccountEntity } from './entities/apex-account.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/user.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApexAccountEntity, UserEntity]),
    UserModule,
  ],
  providers: [
    ApexAccountService
  ],
  exports: [
    ApexAccountService,
  ]
})
export class ApexAccountModule {}
