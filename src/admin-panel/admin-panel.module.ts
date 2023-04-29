import { Module } from '@nestjs/common';
import { AdminModule } from '@adminjs/nestjs';
import { UserEntity } from 'src/user/user.entity';

@Module({
    imports: [
        AdminModule.createAdmin({
            adminJsOptions: {
                rootPath: '/admin',
                resources: [],
            },
        }),
    ],
    controllers: [],
    providers: [],
    exports: [],
})
export class AdminPanelModule {}
