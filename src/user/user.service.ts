import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "./user.entity";
import { Repository } from "typeorm";
import { UserInterface } from "./user.interface";
import { DiscordService } from "src/discord/discord.service";

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        private readonly discordService: DiscordService,
    ) {}

    /**
     * Find a user by their ID
     * @param id The ID of the user
     * @returns The user
     */
    async findById(id: number): Promise<UserEntity> {
        return await this.userRepository.findOneBy({ id });
    }

    /**
     * Find a user by their Discord ID
     * @param discord_id The Discord ID of the user
     * @returns The user
     */
    async findByDiscordId(discord_id: string): Promise<UserEntity> {
        return await this.userRepository.findOneBy({ discord_id });
    }

    /**
     * Find a user by their email address
     * @param email The email address of the user
     * @returns The user
     */
    async findByEmail(email: string): Promise<UserEntity> {
        return await this.userRepository.findOneBy({ email });
    }

    /**
     * Create a new user
     * @param user The user to create
     * @returns The created user
     */
    async create(user: UserInterface): Promise<UserEntity> {

        // If user doesn't exist on Discord, abort
        console.log(`Checking if user ${user.discord_id} exists on Discord`);
        if (!await this.discordService.userExists(user.discord_id)) {
            console.log(`User ${user.discord_id} does not exist on Discord`);
            return null;
        }

        const newUser = await this.userRepository.create({
            discord_id: user.discord_id,
            email: user.email,
            is_admin: user.is_admin || false,
        });

        return await this.userRepository.save(newUser);
    }

    /**
     * Update a user by their ID
     * @param id The ID of the user to update
     * @param properties The properties to update
     * @returns The updated user
     */
    async update(id: number, properties: any): Promise<UserEntity> {
        
        const user = await this.findById(id);

        if (!user) {
            throw new BadRequestException('User not found');
        }

        try {
            Object.assign(user, properties);

            return await this.userRepository.save(user);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}