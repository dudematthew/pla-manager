import { Injectable } from '@nestjs/common';
import { CreateCommunityEventDto } from './dto/create-community-event.dto';
import { UpdateCommunityEventDto } from './dto/update-community-event.dto';

@Injectable()
export class CommunityEventService {
  create(createCommunityEventDto: CreateCommunityEventDto) {
    return 'This action adds a new communityEvent';
  }

  findAll() {
    return `This action returns all communityEvent`;
  }

  findOne(id: number) {
    return `This action returns a #${id} communityEvent`;
  }

  update(id: number, updateCommunityEventDto: UpdateCommunityEventDto) {
    return `This action updates a #${id} communityEvent`;
  }

  remove(id: number) {
    return `This action removes a #${id} communityEvent`;
  }
}
