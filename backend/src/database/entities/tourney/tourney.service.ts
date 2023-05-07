import { Injectable } from '@nestjs/common';
import { CreateTourneyDto } from './dto/create-tourney.dto';
import { UpdateTourneyDto } from './dto/update-tourney.dto';

@Injectable()
export class TourneyService {
  create(createTourneyDto: CreateTourneyDto) {
    return 'This action adds a new tourney';
  }

  findAll() {
    return `This action returns all tourney`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tourney`;
  }

  update(id: number, updateTourneyDto: UpdateTourneyDto) {
    return `This action updates a #${id} tourney`;
  }

  remove(id: number) {
    return `This action removes a #${id} tourney`;
  }
}
