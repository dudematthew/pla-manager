import {
    Injectable,
    Dependencies
} from '@nestjs/common';
import {
    InjectRepository,
    getRepositoryToken
} from '@nestjs/typeorm';
import {
    User
} from './user.entity';
import {
    Repository
} from 'typeorm';
import {
    UserInterface
} from './user.interface';

@Injectable()
@Dependencies(getRepositoryToken(User))
export class UserService {
    constructor(
        @InjectRepository(User) private userRepository: Repository < User >
    ) {}

    async findAll() {
        return this.userRepository.find();
    }

    async findOne(id) {
        return this.userRepository.findOneBy({
            id
        });
    }

    async findByDiscordId(discordId) {
        return this.userRepository.findOneBy({
            discordId
        });
    }

    async create(user: UserInterface): Promise < User > {
        const {
            discordId
        } =
        user;

        const newUser = await this.userRepository.create({
            discordId
        });

        return await this.userRepository.save(newUser);
    }

    async update(id, user: UserInterface) {
        const {
            discordId
        } = user;

        const userToUpdate = await this.userRepository.findOneBy({
            id
        });

        userToUpdate.discordId = discordId;

        return await this.userRepository.save(userToUpdate);

    }

    async remove(id) {
        await this.userRepository.delete(id);
    }
}