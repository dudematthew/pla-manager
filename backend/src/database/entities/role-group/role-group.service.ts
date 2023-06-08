import { Inject, Injectable, InternalServerErrorException, forwardRef } from '@nestjs/common';
import { CreateRoleGroupDto } from './dto/create-role-group.dto';
import { UpdateRoleGroupDto } from './dto/update-role-group.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleGroupEntity } from './entities/role-group.entity';
import { DiscordService } from 'src/discord/discord.service';
import { RoleEntity } from '../role/entities/role.entity';
import { Role } from 'discord.js';

@Injectable()
export class RoleGroupService {

  constructor (
    @InjectRepository(RoleGroupEntity)
    private readonly roleGroupRepository: Repository<RoleGroupEntity>,
    @Inject(forwardRef(() => DiscordService))
    private readonly discordService: DiscordService,
  ) {}

  async create (roleGroup: CreateRoleGroupDto) {
    const newRoleGroup = this.roleGroupRepository.create({
      name: roleGroup.name,
    })

    return await this.roleGroupRepository.save(newRoleGroup);
  }

  async findAll () {
    return await this.roleGroupRepository.find({
      relations: ['roles'],
    });
  }

  async getAllRolesByGroupName (roleGroupName: string): Promise<RoleEntity[]> {
    const roleGroup = await this.roleGroupRepository.findOne({
      where: {
        name: roleGroupName,
      },
      relations: ['roles'],
    });

    return roleGroup.roles;
  }

  async getAllRolesByGroupId (roleGroupId: number): Promise<RoleEntity[]> {
    const roleGroup = await this.roleGroupRepository.findOne({
      where: {
        id: roleGroupId,
      },
      relations: ['roles'],
    });

    return roleGroup.roles;
  }

  async getAllDiscordRolesByGroupName (roleGroupName: string): Promise<Role[]> {
    const roles: RoleEntity[] = await this.getAllRolesByGroupName(roleGroupName);

    const discordRoles = [];
    for(const role of roles) {
      discordRoles.push(await this.discordService.getRoleById(role.discordId));
    }

    return discordRoles;
  }

  async findById (id: number): Promise<RoleGroupEntity> {
    return await this.roleGroupRepository.findOne({
      where: { id },
      relations: ['roles'],
    });
  }

  async findByName (name: string): Promise<RoleGroupEntity> {
    return await this.roleGroupRepository.findOne({
      where: { name },
      relations: ['roles'],
    });
  }

  async update (id: number, roleGroup: UpdateRoleGroupDto) {
    const updatedRoleGroup = await this.findById(id);

    if (!updatedRoleGroup)
      return null;

    try {
      Object.assign(updatedRoleGroup, roleGroup);

      return await this.roleGroupRepository.save(updatedRoleGroup);
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  async remove (id: number) {
    return await this.roleGroupRepository.delete(id);
  }
}
