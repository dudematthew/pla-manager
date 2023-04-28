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

        console.log(`Social login`, req.user);

        // Passport middleware will attach the user object to the request object
        // if the user is authenticated
        if (!req.user) {
            throw new BadRequestException('No account presented');
        }

        const user: UserInterface = {
            ...req.user,
            discord_id: req.user.discordId,
            email: req.user.email,
            is_admin: req.user.is_admin,
        }

        // Check if the user exists in the database
        const existingUser = await this.userService.findByDiscordId(user.discord_id);

        if (existingUser) {
            console.log(`User already exists`, req.user, existingUser);
            return existingUser;
        }

        console.log(`Creating new user`, req.user);

        const newUser = await this.userService.create(user);
        return newUser;
    }

}