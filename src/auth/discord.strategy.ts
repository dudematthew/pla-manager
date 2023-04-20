import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-discord";

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, 'discord') {
    constructor() {
        super({
            clientID: process.env.DISCORD_CLIENT_ID,
            clientSecret: process.env.DISCORD_CLIENT_SECRET,
            callbackURL: process.env.DISCORD_CALLBACK_URL,
            scope: ['identify', 'email'],
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: any, done: (error: any, user?: any, info?: any) => void) {
        
        const { id, username, discriminator, avatar, email } = profile;

        const user = {
            discordId: id,
            username,
            discriminator,
            avatar,
            email,
            accessToken,
            refreshToken,
        };

        done(null, user);

        console.log(user);
    }
}