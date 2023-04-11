import {
    Injectable,
    Dependencies
} from '@nestjs/common';
import {
    InjectRepository,
    getRepositoryToken
} from '@nestjs/typeorm';
import {
    Role
} from './role.entity';
import {
    Repository
} from 'typeorm';
import {
    RoleInterface
} from './role.interface';
import { UserService } from '../user/user.service';
import { InjectDiscordClient } from '@discord-nestjs/core';
import { Client } from 'discord.js';

@Injectable()
@Dependencies(getRepositoryToken(Role))
export class RoleService {
    constructor(
        @InjectRepository(Role) 
        private roleRepository: Repository < Role >,
        private userService: UserService,
        @InjectDiscordClient() 
        private readonly client: Client
    ) {}

    async findAll() {
        return this.roleRepository.find();
    }

    async findOne(id) {
        return this.roleRepository.findOneBy({
            id
        });
    }

    async findByDiscordId(discordId) {
        return this.roleRepository.findOneBy({
            discordId
        });
    }

    async findByName(name) {
        return this.roleRepository.findOneBy({
            name
        });
    }

    async create(role: RoleInterface): Promise < Role > {
        const {
            discordId
        } =
        role;

        const newUser = await this.roleRepository.create({
            discordId
        });

        return await this.roleRepository.save(newUser);
    }

    async update(id, role: RoleInterface) {
        const {
            discordId,
            name
        } = role;

        const roleToUpdate = await this.roleRepository.findOneBy({
            id
        });

        roleToUpdate.discordId = discordId;
        roleToUpdate.name = name;

        return await this.roleRepository.save(roleToUpdate);

    }

    async remove(id) {
        await this.roleRepository.delete(id);
    }

    // async userHasRole(userId, roleName) {
    //     const user = await this.userService.findOne(userId);

    //     const role = await this.roleRepository.findOneBy({
    //         name: roleName
    //     });

    //     return user.roles.includes(role);
    // }

    // async discordUserHasRole(discordUserId, roleName) {
    //     let roleDiscordId = (await this.findByName(roleName)).discordId;

    // }
}