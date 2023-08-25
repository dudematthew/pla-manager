import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateInsideTeamDto } from './dto/create-inside-team.dto';
import { UpdateInsideTeamDto } from './dto/update-inside-team.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { InsideTeamEntity } from './entities/inside-team.entity';
import { Repository } from 'typeorm';
import { RoleService } from '../role/role.service';

@Injectable()
export class InsideTeamsService {

  constructor (
    @InjectRepository(InsideTeamEntity)
    private readonly insideTeamRepository: Repository<InsideTeamEntity>,
    private readonly roleService: RoleService,
  ) {}

  /**
   * Find a inside team by their ID
   * @param id The ID of the inside team
   * @returns The inside team
   */
  async findById(id: number): Promise<InsideTeamEntity> {
    return await this.insideTeamRepository.findOne({
      where: { id },
      relations: [
        'role',
      ],
    });
  }

  async findByName(name: string): Promise<InsideTeamEntity> {
    return await this.insideTeamRepository.findOne({
      where: { name },
      relations: [
        'role',
      ],
    });
  }

  async update(id: number, properties: UpdateInsideTeamDto) {
    
    const insideTeam = await this.findById(id);

    if (!insideTeam) {
      throw new Error('Inside team not found');
    }

    const role = await this.roleService.findById(properties.roleId);

    if (!role) {
      throw new Error('Role not found');
    }

    try {
      await this.insideTeamRepository.update(id, properties);
      return await this.findById(id);
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

}