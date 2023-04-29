import { Injectable } from "@nestjs/common";
import { Strategy } from "passport-discord";
import { PassportStrategy } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { DiscordService } from "src/discord/discord.service";
import { PermissionsBitField } from "discord.js";
import { UnauthorizedException } from "@nestjs/common";
import { Profile } from "passport-discord";

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly authService: AuthService,
        private readonly discordService: DiscordService,
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

    async validate(
        accessToken: string, 
        refreshToken: string, 
        profile: Profile, 
        ) {

        const { id, username, discriminator, avatar, email } = profile;

        console.log('Validating Discord user', profile);

        // Check if user is an admin on Discord
        const isAdmin = await this.discordService.userHasRights(id, PermissionsBitField.Flags.Administrator);

        const loggedUser = await this.authService.socialLogin({
            user: {
                discordId: id,
                email: email,
                isAdmin: isAdmin
            }
        });


        if (!loggedUser) {
            console.log("Logged user:", loggedUser);
            throw new UnauthorizedException();
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

        console.log('User: ', user);

        return user;
    }
}