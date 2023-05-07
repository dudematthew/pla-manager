import { Controller, UseGuards, Get, Req, Res } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { DiscordAuthGuard } from "./guards/discord.guard";
import { AuthenticatedGuard } from "./guards/authenticated.guard";

@Controller('auth/discord')
export class DiscordAuthController {

    /**
     * Redirects the user to the Discord OAuth2 login page
     * @returns {void}
     * @memberof DiscordAuthController
     */
    @Get()
    @UseGuards(DiscordAuthGuard)
    async discordAuth(@Res() res): Promise<void> {
        res.redirect('http://localhost:3000/profile');
    }

    /**
     * Discord OAuth2 callback
     * @param {Response} res
     */
    @Get('callback')
    @UseGuards(DiscordAuthGuard)
    async discordAuthCallback(@Res() res): Promise<void> {
        // res.send(200);
        res.redirect('http://localhost:3000/profile');
    }

    /**
     * Returns the current user
     * @memberof DiscordAuthController
     * @returns {void}
     * @todo Implement
     * @todo Add @Req() req parameter
     * @todo Add @Res() res parameter
     */
    @Get('status')
    @UseGuards(AuthenticatedGuard)
    async status(): Promise<string> {
        return 'OK';
    }

    /**
     * Logs the user out
     */
    @Get('logout')
    async logout(): Promise<void> {

    }
}