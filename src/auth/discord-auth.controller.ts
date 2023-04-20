import { Controller, UseGuards, Get, Req, Res } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Controller('auth/discord')
export class DiscordAuthController {

    @Get()
    @UseGuards(AuthGuard('discord'))
    async discordAuth(): Promise<void> {}

    @Get('callback')
    @UseGuards(AuthGuard('discord'))
    async discordAuthCallback(@Req() req, @Res() res) {
        res.redirect('http://localhost:3000');
    }
}