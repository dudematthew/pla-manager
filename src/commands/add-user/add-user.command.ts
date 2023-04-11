import { Command, Handler, InteractionEvent } from '@discord-nestjs/core';
import { Injectable, ValidationPipe } from '@nestjs/common';
import { Interaction } from 'discord.js';
import { SlashCommandPipe } from '@discord-nestjs/common';
import { AddUserCommandDto } from './add-user.command.dto';
import { UserService } from 'src/user/user.service';

@Command({
  name: 'dodaj-uzytkownika',
  description: 'Dodaj użytkownika do bazy danych',
})
@Injectable()
export class AddUserCommand {
  constructor(
    // @InjectDiscordClient()
    // private readonly client: Client,
    private readonly userService: UserService,
  ) {}


  @Handler()
  async onExecute(
    @InteractionEvent(SlashCommandPipe, ValidationPipe) 
    options: AddUserCommandDto,
    @InteractionEvent()
    interaction: Interaction,
  ) {
    let guild = interaction.guild;
    let user: any;
    try {
      user = await guild.members.fetch(options.user);
    } catch (error) {
      return `Użytkownik ${options.user} nie jest członkiem serwera`;
    }
    // let author = interaction.user;

    // Check if user is a bot
    if (user.user.bot) {
      return 'Nie możesz dodać bota do bazy danych';
    }

    // Check if user is already in database
    const userInDatabase = await this.userService.findByDiscordId(user.id);
    if (userInDatabase) {
      return 'Użytkownik jest już w bazie danych';
    }

    // Add user to database
    await this.userService.create({
      discordId: user.id,
    });

    // const user: User = this.client.users.cache.get(options.user);
    return 'Pomyślnie dodano użytkownika: ' + options.user;
  }
}