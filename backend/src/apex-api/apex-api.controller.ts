import { Controller, Get } from '@nestjs/common';
import { ApexApiService } from './apex-api.service';

@Controller('/api/apex-api')
export class ApexApiController {

    constructor(
        private readonly apexApiService: ApexApiService,
    ) {}

    @Get()
    async apexApi(): Promise<string> {
        console.log("Starting Apex API scrape...");

        await this.apexApiService.scrapeClubData();

        return 'OK';
    }
}
