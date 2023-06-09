import { BadRequestException, Inject, Injectable, InternalServerErrorException, forwardRef } from "@nestjs/common";
import { UserEntity } from "./user.entity";
import { Repository } from "typeorm";
import { UserInterface } from "./user.interface";
import { DiscordService } from "src/discord/discord.service";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        @Inject(forwardRef(() => DiscordService))
        private readonly discordService: DiscordService,
    ) {}

    /**
     * Find a user by their ID
     * @param id The ID of the user
     * @returns The user
     */
    async findById(id: number): Promise<UserEntity> {
        return await this.userRepository.findOne({
            where: { id },
            relations: ['apexAccount']
          });
    }

    /**
     * Find a user by their Discord ID
     * @param discordId The Discord ID of the user
     * @returns The user
     */
    async findByDiscordId(discordId: string): Promise<UserEntity> {
        return await this.userRepository.findOne({
            where: { discordId },
            relations: ['apexAccount']
          });
    }

    /**
     * Find a user by their email address
     * @param email The email address of the user
     * @returns The user
     */
    async findByEmail(email: string): Promise<UserEntity> {
        return await this.userRepository.findOne({
            where: { email },
            relations: ['apexAccount']
          });
    }

    /**
     * Create a new user
     * @param user The user to create
     * @returns The created user
     */
    async create(user: UserInterface): Promise<UserEntity> {

        // If user doesn't exist on Discord, abort
        console.log(`Checking if user ${user.discordId} exists on Discord`);
        if (!await this.discordService.userExists(user.discordId)) {
            console.log(`User ${user.discordId} does not exist on Discord`);
            return null;
        }

        const newUser = await this.userRepository.create({
            discordId: user.discordId,
            email: user.email,
            isAdmin: user.isAdmin || false,
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