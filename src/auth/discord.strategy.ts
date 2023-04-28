import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-discord";
import { AuthService } from "./auth.service";
import { DiscordService } from "src/discord/discord.service";
import { PermissionsBitField } from "discord.js";
import { UserSerializer } from "./user.serializer";

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, 'discord') {
    constructor(
        private readonly authService: AuthService,
        private readonly discordService: DiscordService,
        private readonly userSerializer: UserSerializer,
    ) {
        console.log(
            'Discord env:',
            process.env.DISCORD_CLIENT_ID,
            process.env.DISCORD_CLIENT_SECRET,
            process.env.DISCORD_REDIRECT_URL,
        );
        super({
            clientID: process.env.DISCORD_CLIENT_ID,
            clientSecret: process.env.DISCORD_CLIENT_SECRET,
            callbackURL: process.env.DISCORD_REDIRECT_URL,
            scope: ['identify', 'email'],
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: any, done: (error: any, user?: any, info?: any) => void) {
        
        const { id, username, discriminator, avatar, email } = profile;

        console.log('Validating Discord user', profile);

        // Check if user is an admin on Discord
        const isAdmin = await this.discordService.userHasRights(id, PermissionsBitField.Flags.Administrator);

        const loggedUser = await this.authService.socialLogin({
            user: {
                discordId: id,
                email: email,
                is_admin: isAdmin
            }
        });

        console.log("Logged user:", loggedUser);

        if (!loggedUser) {
            console.log("Logged user:", loggedUser);
            done(null, false);
            return;
        }

        let user = {
            discordId: id,
            username,
            discriminator,
            email,
            avatar,
            accessToken,
            refreshToken,
        }

        // this.userSerializer.serializeUser(user, done);

        console.log('User: ', user);

        done(null, user);

        return user;
    }
}