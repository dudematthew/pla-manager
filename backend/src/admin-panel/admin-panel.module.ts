import { Module } from '@nestjs/common';
import { AdminModule } from '@adminjs/nestjs';

import * as AdminJSTypeorm from '@adminjs/typeorm';
import AdminJS from 'adminjs';
import { UserResource } from './resources/user.resource';
import { AdminPanelLocale } from './admin-panel.locale';
import { ChannelResource } from './resources/channel.resource';
import { componentLoader } from './components/components';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import { TourneyResource } from './resources/tourney.resource';
import { TourneyTeamResource } from './resources/tourney-team.resource';

AdminJS.registerAdapter({
    Resource: AdminJSTypeorm.Resource,
    Database: AdminJSTypeorm.Database,
});


@Module({
    imports: [
        AdminModule.createAdminAsync({
            //   imports: [TypeOrmModule.forFeature([UserEntity])],
            imports: [AuthModule],
            useFactory: async (authService: AuthService) => ({
                adminJsOptions: {
                    rootPath: '/admin',
                    resources: [
                        UserResource,
                        ChannelResource,
                        // TourneyResource,
                        TourneyTeamResource
                    ],
                    componentLoader: componentLoader,
                    locale: AdminPanelLocale,
                    branding: {
                        logo: 'https://i.imgur.com/4by23BO.png',
                        companyName: 'PLA Admin Panel',
                        withMadeWithLove: false,
                        favicon: 'https://i.imgur.com/4by23BOs.png',
                    },
                },
                auth: {
                    authenticate: (email: string, password: string) => {
                        return authService.adminLogin(email, password);
                    },
                    cookieName: 'adminjs',
                    cookiePassword: 'adminjs-password',
                },
                sessionOptions: {
                    resave: false,
                    saveUninitialized: false,
                    secret: process.env.SESSION_SECRET,
                },
                versionSettings: {
                    admin: true,
                    app: '1.0.0',
                },
            }),
            inject: [AuthService],
        }),
    ],
    controllers: [],
    providers: [],
    exports: [],
})
export class AdminPanelModule {}

console.log('Admin Panel Module Loaded: ', AdminJS.bundle);