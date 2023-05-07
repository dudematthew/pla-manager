import { BadRequestException, Injectable } from "@nestjs/common";
import { UserService } from "src/database/entities/user/user.service";
import { UserInterface } from "src/database/entities/user/user.interface";
import { UserEntity } from "src/database/entities/user/user.entity";
import { DiscordService } from "src/discord/discord.service";

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private discordService: DiscordService,
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

    async adminLogin (email: string, password: string) {
        const user: UserEntity = await this.userService.findByEmail(email);
    
        if (!user || user?.isAdmin === false)
            return null;
    
        // Check if password is equal .env ADMIN_PASSWORD
        if (password === process.env.ADMIN_PASSWORD) {
            const discordUser = await this.discordService.getUserById(user.discordId);
    
            if (!discordUser)
                return null;
    
            const adminProfile = {
                email: user.email,
                title: await discordUser.username,
                avatarUrl: await discordUser.displayAvatarURL(),
                id: user.id.toString(),
            }
    
            return adminProfile;
        }
        
        return null;
    };
}