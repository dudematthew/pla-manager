import { Inject, Injectable, InternalServerErrorException, forwardRef } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleEntity } from './entities/role.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { DiscordService } from 'src/discord/discord.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RoleService {

  constructor(
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    @Inject(forwardRef(() => DiscordService))
    private readonly discordService: DiscordService,
    private readonly configService: ConfigService,
  ) {}

  async create(role: CreateRoleDto): Promise<RoleEntity> {
    if (!await this.discordService.roleExists(role.discordId)) {
        return null;
    }

    const newRole = this.roleRepository.create({
        discordId: role.discordId,
        name: role.name,
    });

    return await this.roleRepository.save(newRole);
  }

  async findAll() {
    return await this.roleRepository.find({
      relations: [
        'emoji',
        'roleGroup'
      ]
    });
  }

  async getAllInsideRoles() {
    const insideRoleNames = this.configService.get<string[]>('role-names.pla-inside.team.teams');

    const prefixedInsideRoleNames = insideRoleNames.map(roleName => this.configService.get<string>('role-names.pla-inside.team.prefix') + roleName);

    return await this.roleRepository.find({
      where: {
          name: In(prefixedInsideRoleNames)
        },
        relations: [
        'emoji',
        'roleGroup'
      ]
    });
  }

  async findById(id: number): Promise<RoleEntity> {
    return await this.roleRepository.findOne({ 
      where: { id },
      relations: [
        'emoji',
        'roleGroup'
      ]
     });
  }

  async findByDiscordId(discordId: string): Promise<RoleEntity> {
    return await this.roleRepository.findOne({ 
      where: { discordId },
      relations: [
        'emoji',
        'roleGroup'
      ]
     });
  }

  /**
   * Find a role by its database name
   * @param name The name of the role
   * @returns The role
   */
  async findByName(name: string): Promise<RoleEntity> {
    return await this.roleRepository.findOne({ 
      where: { name },
      relations: [
        'emoji',
        'roleGroup'
      ]
     });
  }

  /**
   * Find roles by their names
   * @param {String[]} names The names of the roles
   * @returns The roles
   */
  async findByNames(names: string[]): Promise<RoleEntity[]> {
    return await this.roleRepository.find({
        where: {
            name: In(names)
        },
        relations: [
        'emoji',
        'roleGroup'
      ]
    });
  }
    

  async update(id: number, properties: UpdateRoleDto) {
    const role = await this.findById(id);

    if (!role) {
        return null;
    }

    try {
      Object.assign(role, properties);

      return await this.roleRepository.save(role);
    } catch (error) {
      throw new InternalServerErrorException(error);
    } 
  }

  async remove(id: number) {
    return await this.roleRepository.delete(id);
  }
}
