import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthenticatedGuard } from './auth/guards/authenticated.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(@Req() req): string {
    
    this.appService.sendDiscordMessage('Jestem bogiem');

    // Return user data nicely formatted to string
    return JSON.stringify(req.user, null, 4);
  }

  @Get('profile')
  @UseGuards(AuthenticatedGuard)
  getProfile(@Req() req): string {
    return JSON.stringify(req.user, null, 4);
  }

}
