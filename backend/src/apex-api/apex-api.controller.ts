import { Controller, Get } from '@nestjs/common';
import { ApexApiService } from './apex-api.service';

@Controller('/api/club')
export class ApexApiController {

    constructor(
        private readonly apexApiService: ApexApiService,
    ) {}

    @Get()
    async apexApi(): Promise<object> {
        console.log("Starting Apex API scrape...");

        return await this.apexApiService.scrapeClubData();
    }
}
