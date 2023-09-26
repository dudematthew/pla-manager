import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateGiveawayMemberDto } from './dto/create-giveaway-member.dto';
import { UpdateGiveawayMemberDto } from './dto/update-giveaway-member.dto';
import { GiveawayMemberEntity } from './entities/giveaway-member.entity';

@Injectable()
export class GiveawayMemberService {
    constructor(
        @InjectRepository(GiveawayMemberEntity)
        private readonly giveawayMemberRepository: Repository<GiveawayMemberEntity>,
    ) {}

    async create(createGiveawayMemberDto: CreateGiveawayMemberDto): Promise<GiveawayMemberEntity> {
        
        const existingGiveawayMember = await this.findOneByTwichNick(createGiveawayMemberDto.twitchNick);

        if (existingGiveawayMember) {
            return null;
        }

        const newGiveawayMember = this.giveawayMemberRepository.create({
            twitchId: createGiveawayMemberDto.twitchId,
            twitchNick: createGiveawayMemberDto.twitchNick,
            user: {
                id: createGiveawayMemberDto.user.id,
            }
        });
        return await this.giveawayMemberRepository.save(newGiveawayMember);
    }

    async findAll(): Promise<GiveawayMemberEntity[]> {
        return await this.giveawayMemberRepository.find({
            relations: [
                'user',
            ]
        });
    }

    async findOneById(id: number): Promise<GiveawayMemberEntity> {
        return await this.giveawayMemberRepository.findOne({
            where: { id },
            relations: [
                'user',
            ]
        });
    }

    async findOneByDiscordId(discordId: string): Promise<GiveawayMemberEntity> {
        return await this.giveawayMemberRepository.findOne({
            where: { 
                user: {
                    discordId
                }
             },
            relations: [
                'user',
            ]
        });
    }

    async findOneByTwichNick(twitchNick: string): Promise<GiveawayMemberEntity> {
        return await this.giveawayMemberRepository.findOne({
            where: { twitchNick },
            relations: [
                'user',
            ]
        });
    }

    async update(id: number, updateGiveawayMemberDto: UpdateGiveawayMemberDto): Promise<GiveawayMemberEntity> {
        const giveawayMember = await this.findOneById(id);

        if (!giveawayMember) {
            throw new BadRequestException('Giveaway Member not found');
        }

        try {
            Object.assign(giveawayMember, updateGiveawayMemberDto);
            return await this.giveawayMemberRepository.save(giveawayMember);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    async remove(id: number): Promise<void> {
        await this.giveawayMemberRepository.delete(id);
    }
}
