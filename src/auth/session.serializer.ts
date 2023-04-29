import { Injectable } from "@nestjs/common";
import { UserService } from "src/user/user.service";
import { PassportSerializer } from "@nestjs/passport";
import { UserEntity } from "src/user/user.entity";

@Injectable()
export class SessionSerializer extends PassportSerializer {
    constructor (
        private userService: UserService,
    ) {
        super();
    }

    serializeUser(user: any, done: (err: Error, user: UserEntity) => void) {
        console.log(`Serializing user`, user);
        done(null, user);
    }

    async deserializeUser(deserializedUser: UserEntity, done: (err: Error, user: UserEntity) => void) {
        const user = await this.userService.findByDiscordId(deserializedUser.discordId);
        console.log(`Deserialized user`, user);
        return user ? done(null, user) : done(null, null);
    }

}