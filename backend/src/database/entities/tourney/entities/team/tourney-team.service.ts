import { Injectable } from '@nestjs/common';
import { CreateTeamDto } from './dto/create-tourney-team.dto';
import { UpdateTeamDto } from './dto/update-tourney-team.dto';

@Injectable()
export class TeamService {
  create(createTeamDto: CreateTeamDto) {
    return 'This action adds a new team';
  }

  findAll() {
    return `This action returns all team`;
  }

  findOne(id: number) {
    return `This action returns a #${id} team`;
  }

  update(id: number, updateTeamDto: UpdateTeamDto) {
    return `This action updates a #${id} team`;
  }

  remove(id: number) {
    return `This action removes a #${id} team`;
  }
}
