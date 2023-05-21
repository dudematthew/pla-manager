import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateEmojiDto } from './dto/create-emoji.dto';
import { UpdateEmojiDto } from './dto/update-emoji.dto';
import { DiscordService } from 'src/discord/discord.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmojiEntity } from './entities/emoji.entity';

@Injectable()
export class EmojiService {

  constructor(
    private readonly discordService: DiscordService,
    @InjectRepository(EmojiEntity)
    private readonly emojiRepository: Repository<EmojiEntity>,
  ) {}

  async create(emoji: CreateEmojiDto) {
    const emojiExists = this.discordService.serverEmojiExists(emoji.name);

    if (!emojiExists)
      return null;

      const newEmoji = this.emojiRepository.create({
        discordId: emoji.discordId,
        name: emoji.name,
    });

    return await this.emojiRepository.save(newEmoji);
  }

  findAll() {
    return this.emojiRepository.find();
  }

  findById(id: number) {
    return this.emojiRepository.findOneBy({ id });
  }

  findByDiscordId(discordId: string) {
    return this.emojiRepository.findOneBy({ discordId });
  }

  async update(id: number, properties: UpdateEmojiDto) {
    const emoji = await this.findById(id);

    if (!emoji)
      return null;

    try {
      Object.assign(emoji, properties);

      return await this.emojiRepository.save(emoji);
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  async remove(id: number) {
    return await this.emojiRepository.delete(id);
  }
}
