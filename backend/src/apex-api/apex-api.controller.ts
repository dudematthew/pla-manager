import { Controller, Get, Query, Req } from '@nestjs/common';
import { ApexApiService } from './apex-api.service';
import { PlayerStatisticsParamsDto } from './dtos/player-statistics-params.dto';
import { PlayerStatistics } from './player-statistics.interface';

@Controller('/api/apex-api')
export class ApexApiController {

    constructor(
        private readonly apexApiService: ApexApiService,
    ) {}

    @Get('club')
    async apexApi(): Promise<object> {
        console.log("Starting Apex API scrape...");

        return await this.apexApiService.scrapeClubData();
    }

    /**
     * Get player statistics by UUID
     * @param playerUUID
     * @param platform
     * @returns
     */
    @Get('player')
    async playerStatistics(@Query() params: PlayerStatisticsParamsDto): Promise<PlayerStatistics> {
        console.log(params);
        
        if (typeof params.player !== 'undefined') {
            return await this.apexApiService.getPlayerStatisticsByName(params.player, params.platform, params);
        } else if (typeof params.uid !== 'undefined') {
            return await this.apexApiService.getPlayerStatisticsByUID(params.uid, params.platform, params);
        } else {
            return {
                error: 'No player name or UUID provided',
            };
        }
    }
}
