import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateEmojiDto } from './dto/create-emoji.dto';
import { UpdateEmojiDto } from './dto/update-emoji.dto';
import { DiscordService } from 'src/discord/discord.service';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { EmojiEntity } from './entities/emoji.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmojiService {

  constructor(
    private readonly discordService: DiscordService,
    @InjectRepository(EmojiEntity)
    private readonly emojiRepository: Repository<EmojiEntity>,
    private readonly configService: ConfigService,
  ) {}

  async create(emoji: CreateEmojiDto) {
    const emojiExists = this.discordService.serverEmojiExists(emoji.name);

    if (!emojiExists)
      return null;

      const newEmoji = this.emojiRepository.create({
        discordId: emoji.discordId,
        name: emoji.name,
        discordName: emoji.discordName,
    });

    return await this.emojiRepository.save(newEmoji);
  }

  findAll() {
    return this.emojiRepository.find({
      relations: [
        'roles'
      ]
    });
  }

  findById(id: number) {
    return this.emojiRepository.findOne({ 
      where: { id },
      relations: [
        'roles',
      ]
     });
  }

  findByName(name: string) {
    return this.emojiRepository.findOne({ 
      where: { name },
      relations: [
        'roles',
      ]
     });
  }

  findByDiscordId(discordId: string) {
    return this.emojiRepository.findOne({ 
      where: { discordId },
      relations: [
        'roles',
      ]
     });
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

  async getDiscordEmojiById(id: number) {
    const emoji = await this.findById(id);

    if (!emoji)
      return null;

    return await this.discordService.getServerEmojiByName(emoji.name);
  }

  async getDiscordEmojiByName(name: string) {
    const emoji = await this.findByName(name);

    if (!emoji)
      return null;

    return await this.discordService.getServerEmojiByName(emoji.name);
  }

  async getPLAInsideTeamEmojis(): Promise<EmojiEntity[]> {
    const teamSuffixes = this.configService.get<string[]>('role-names.pla-inside.team.teams');

    // Prefix every team name
    const teamEmojiNames = teamSuffixes.map(teamName => `pla${teamName}`);

    return await this.emojiRepository.find({
      where: {
        name: In(teamEmojiNames)
      },
      relations: [
        'roles'
      ]
    });
  }

  /**
   * List all emojis for PLA Inside teams
   * @returns An object with team names as keys and emojis as values
   */
  async getDiscordPLAInsideTeamEmojis() {
    const teamEmojis = await this.getPLAInsideTeamEmojis();

    // Create an object with team names as keys and emojis as values
    const emojis = {};

    for (const emoji of teamEmojis) {
      emojis[emoji.name] = await this.discordService.getServerEmojiByName(emoji.name);
    }

    return emojis;
  }
}
