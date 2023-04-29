import { BadRequestException, Injectable } from "@nestjs/common";
import { UserService } from "src/user/user.service";
import { UserInterface } from "src/user/user.interface";
import { UserEntity } from "src/user/user.entity";

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
    ) {}

    async socialLogin(req: { user: any; }): Promise<UserEntity> {

        // Passport middleware will attach the user object to the request object
        // if the user is authenticated
        if (!req.user) {
            return null;
        }

        const user: UserInterface = {
            ...req.user,
            discordId: req.user.discordId,
            email: req.user.email,
            isAdmin: req.user.isAdmin,
        }

        // Check if the user exists in the database
        const existingUser = await this.userService.findByDiscordId(user.discordId);

        if (existingUser) {
            console.log(`User already exists`, req.user, existingUser);
            return existingUser;
        }

        console.log(`Creating new user`, req.user);

        const newUser = await this.userService.create(user);

        if (!newUser) {
            return null;
        }

        return newUser;
    }

}