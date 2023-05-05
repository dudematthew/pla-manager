import { Module } from '@nestjs/common';
import { AdminModule } from '@adminjs/nestjs';
import { UserEntity } from 'src/database/entities/user/user.entity';

import * as AdminJSTypeorm from '@adminjs/typeorm';
import AdminJS from 'adminjs';
import theme from '@adminjs/design-system';
import { ChannelEntity } from 'src/database/entities/channel/channel.entity';
import { UserResource } from './resources/user.resource';
import { AdminPanelLocale } from './admin-panel.locale';
import { ChannelResource } from './resources/channel.resource';
import { componentLoader } from './components/components';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';
import { UserService } from 'src/database/entities/user/user.service';
import { UserModule } from 'src/database/entities/user/user.module';
import { DiscordModule } from 'src/discord/discord.module';
import { DiscordService } from 'src/discord/discord.service';

AdminJS.registerAdapter({
    Resource: AdminJSTypeorm.Resource,
    Database: AdminJSTypeorm.Database,
});

type CurrentAdmin = {
    /**
     * Admin has one required field which is an email
     */
    email: string;
    /**
     * Optional title/role of an admin - this will be presented below the email
     */
    title?: string;
    /**
     * Optional url for an avatar photo
     */
    avatarUrl?: string;
    /**
     * Id of your admin user
     */
    id?: string;
    /**
     * Also you can put as many other fields to it as you like.
     */
    [key: string]: any;
};

const authenticate = async (email: string, password: string, userService: UserService, discordService: DiscordService) => {
    const user: UserEntity = await userService.findByEmail(email);

    if (!user || user?.isAdmin === false)
        return null;

    // Check if password is equal .env ADMIN_PASSWORD
    if (password === process.env.ADMIN_PASSWORD) {
        const discordUser = await discordService.getUserById(user.discordId);

        if (!discordUser)
            return null;

        const adminProfile: CurrentAdmin = {
            email: user.email,
            title: await discordUser.username,
            avatarUrl: await discordUser.displayAvatarURL(),
            id: user.id.toString(),
        }

        return adminProfile;
    }
    
    return null;
};



@Module({
    imports: [
        AdminModule.createAdminAsync({
            //   imports: [TypeOrmModule.forFeature([UserEntity])],
            imports: [UserModule, DiscordModule],
            useFactory: async (userService: UserService, discordService: DiscordService) => ({
                adminJsOptions: {
                    rootPath: '/admin',
                    resources: [
                        UserResource,
                        ChannelResource
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
                        return authenticate(email, password, userService, discordService);
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
            inject: [UserService, DiscordService],
        }),
    ],
    controllers: [],
    providers: [],
    exports: [],
})
export class AdminPanelModule {}
