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

    async findById(id: number): Promise<UserEntity> {
        return await this.userRepository.findOneBy({ id });
    }

    async findByDiscordId(discord_id: string): Promise<UserEntity> {
        return await this.userRepository.findOneBy({ discord_id });
    }

    async findByEmail(email: string): Promise<UserEntity> {
        return await this.userRepository.findOneBy({ email });
    }

    async create(user: UserInterface): Promise<UserEntity> {

        // If user doesn't exist on Discord, abort
        if (!await this.discordService.userExists(user.discord_id)) {
            return null;
        }

        const newUser = await this.userRepository.create({
            discord_id: user.discord_id,
            email: user.email,
            is_admin: user.is_admin || false,
        });

        return await this.userRepository.save(newUser);
    }

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