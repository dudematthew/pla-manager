import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(@Req() req): string {
    
    this.appService.sendDiscordMessage('Jestem bogiem');

    console.log("Req user:", req.user);

    // Return user data nicely formatted to string
    return JSON.stringify(req.user, null, 4);
  }

  @Get('profile')
  // @UseGuards(AuthGuard('discord'))
  getProfile(@Req() req): string {
    console.log("Req user:", req.user);
    return JSON.stringify(req.user, null, 4);
  }

}
