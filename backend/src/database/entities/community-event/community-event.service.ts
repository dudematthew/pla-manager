import { Injectable } from '@nestjs/common';
import { CreateCommunityEventDto } from './dto/create-community-event.dto';
import { UpdateCommunityEventDto } from './dto/update-community-event.dto';
import { CommunityEventEntity } from './entities/community-event.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { UserService } from '../user/user.service';

@Injectable()
export class CommunityEventService {
  
  constructor(
    @InjectRepository(CommunityEventEntity)
    private readonly communityEventRepository: Repository<CommunityEventEntity>,
  ) {}

  async create(createCommunityEventDto: CreateCommunityEventDto, user: UserEntity) {
    const communityEvent = this.communityEventRepository.create({
      ...createCommunityEventDto,
      user,
    });

    await this.communityEventRepository.save(communityEvent);

    return communityEvent;
  }

  async update(id: number, updateCommunityEventDto: UpdateCommunityEventDto): Promise<CommunityEventEntity | null> {
    const communityEvent = await this.communityEventRepository.findOneBy({
      id,
    });

    if (!communityEvent) {
      return null;
    }

    return await this.communityEventRepository.save({
      ...communityEvent,
      ...updateCommunityEventDto,
    });
  }

  async findAll(): Promise<CommunityEventEntity[]> {
    return await this.communityEventRepository.find({
      relations: ['user'],
    });
  }

  async findOneById(id: number): Promise<CommunityEventEntity | null> {
    return await this.communityEventRepository.findOne({
      where: {
        id,
      },
      relations: ['user'],
    })
  }

  async findOneByUserId(userId: number): Promise<CommunityEventEntity | null> {
    return await this.communityEventRepository.findOne({
      where: {
        user: {
          id: userId,
        },
      },
      relations: ['user'],
    })
  }

  async remove(id: number): Promise<void> {
    await this.communityEventRepository.delete({
      id,
    });
  }

  async setApproveState(id: number, approveState: "pending" | "approved" | "rejected"): Promise<CommunityEventEntity | null> {
    const communityEvent = await this.communityEventRepository.findOneBy({
      id,
    });

    if (!communityEvent) {
      return null;
    }

    return await this.communityEventRepository.save({
      ...communityEvent,
      approveState,
    });
  }

}
