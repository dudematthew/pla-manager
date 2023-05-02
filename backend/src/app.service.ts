import { Injectable } from '@nestjs/common';
import { DiscordService } from './discord/discord.service'

@Injectable()
export class AppService {

  constructor(
    private readonly discordService: DiscordService,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  sendDiscordMessage(message: string): string {
    this.discordService.sendMessage('918678381606879232', message);

    return 'Sended Discord Message to channel 918678381606879232';
  }
}
