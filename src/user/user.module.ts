import { Module } from "@nestjs/common";
import { UserEntity } from "./user.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserService } from "./user.service";

@Module({
    providers: [UserService],
    exports: [UserService],
    imports: [
        TypeOrmModule.forFeature([UserEntity])
    ],
})
export class UserModule {}