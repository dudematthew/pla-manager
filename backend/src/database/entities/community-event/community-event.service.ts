import { Injectable, Logger } from '@nestjs/common';
import { CreateCommunityEventDto } from './dto/create-community-event.dto';
import { UpdateCommunityEventDto } from './dto/update-community-event.dto';
import { CommunityEventEntity } from './entities/community-event.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { UserService } from '../user/user.service';

@Injectable()
export class CommunityEventService {
  
  constructor(
    @InjectRepository(CommunityEventEntity)
    private readonly communityEventRepository: Repository<CommunityEventEntity>,
    private readonly userService: UserService,
  ) {}

  private logger = new Logger(CommunityEventService.name);

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
      relations: ['user', 'reminders'],
    });
  }

  async findById(id: number): Promise<CommunityEventEntity | null> {
    return await this.communityEventRepository.findOne({
      where: {
        id,
      },
      relations: ['user', 'reminders'],
    })
  }

  async findByUserId(userId: number): Promise<CommunityEventEntity | null> {
    return await this.communityEventRepository.findOne({
      where: {
        user: {
          id: userId,
        },
      },
      relations: ['user', 'reminders'],
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

  async setReminderForUser(id: number, userId: number, reminder: boolean): Promise<CommunityEventEntity | null> {
    const communityEvent = await this.findById(id);
    if (!communityEvent) {
      this.logger.error(`Community event with id ${id} not found`);
      return null;
    }

    const user = await this.userService.findById(userId);

    if (!user) {
      this.logger.error(`User with id ${userId} not found`);
      return null;
    }

    // this.logger.log(`Community event with id ${id} has ${communityEvent.reminders.length} reminders`);
    
    communityEvent.reminders = reminder ? [...communityEvent.reminders, user] : communityEvent.reminders.filter(reminder => reminder.id !== userId);
    
    // this.logger.log(`Community event with id ${id} has now ${communityEvent.reminders.length} reminders`);

    return await this.communityEventRepository.save(communityEvent);
  }

  async getAllWithReminders(): Promise<CommunityEventEntity[]> {
    // Get all events with reminders and with start date that's in the future
    try {
      const currentDate = new Date();
      const events = await this.communityEventRepository.find({
        where: {
          reminder: true,
          startDate: MoreThan(currentDate),
        },
        relations: ['user', 'reminders'],
      });
      return events;
    } catch (error) {
      // Handle any potential errors
      console.error('Error retrieving events:', error);
      throw error;
    }
  }
}
