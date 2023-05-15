import { CacheTTL, Inject, Injectable, UseInterceptors } from '@nestjs/common';
import { InjectBrowser } from 'nest-puppeteer';
import { ApexApiScraperService } from './apex-api-scraper.service';
import { Logger } from '@nestjs/common';
import { RateLimitedAxiosInstance } from 'axios-rate-limit';
import { HttpService } from '@nestjs/axios';
import { PlayerStatisticsParamsDto } from './dtos/player-statistics-params.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import * as hash from 'object-hash';
import { PlayerStatistics } from './player-statistics.interface';

@Injectable()
export class ApexApiService {

    /**
     * Logger instance
     */
    private logger = new Logger('ApexApiService');

    /**
     * Axios instance with rate limiting
     */
    private http: RateLimitedAxiosInstance;

    private apiKey = process.env.APEX_API_KEY;

    constructor(
        private readonly apexApiScraperService: ApexApiScraperService,
        private readonly httpService: HttpService,
        @Inject(CACHE_MANAGER)
        private readonly cache: Cache,
    ) {
       const rateLimit = require('axios-rate-limit');

        // Rate limit the http service 
        this.http = rateLimit(this.httpService.axiosRef, {
            maxRequests: parseInt(process.env.APEX_API_RATE_LIMIT || '1'),
            perMilliseconds: parseInt(process.env.APEX_API_RATE_MILISECONDS_TRESHOLD || '2000'),
        });
    }

    /**
     * Get player statistics by UID
     * @param playerUID
     * @param platform 
     * @param options 
     * @returns Player statistics
     */
    public async getPlayerStatisticsByUID(playerUID: string, platform: 'PC' | 'PS4' | 'X1' | 'SWITCH', options: PlayerStatisticsParamsDto): Promise<PlayerStatistics> {
        const cachedValue = await this.cache.get(`player-statistics-${hash(options)}`);
        if (cachedValue) {
            return cachedValue;
        }


        let url = `https://api.mozambiquehe.re/bridge?auth=${this.apiKey}&uuid=${playerUID}&platform=${platform}`;

        // Add all options to the url except already added
        for (const option in options) {
            if (option != 'player' && option != 'platform' && option != 'uuid')
                url += `&${option}=${options[option]}`;
        }

        try {
            const response = await this.http.get(url);
            this.cache.set(`player-statistics-${hash(options)}`, response.data, 10000);
            return response.data;
        }
        catch (e) {
            this.logger.error(e, playerUID, platform, options);
            return {
                error: 'Error fetching player statistics: ' + e.message || 'Unknown error',
            };
        }
    }

    /**
     * Get player statistics by name
     * @param playerName 
     * @param platform 
     * @param options 
     * @returns Player statistics
     */
    public async getPlayerStatisticsByName(playerName: string, platform: 'PC' | 'PS4' | 'X1' | 'SWITCH', options: PlayerStatisticsParamsDto): Promise<PlayerStatistics> {

        const cachedValue = await this.cache.get(`player-statistics-${hash(options)}`);
        if (cachedValue) {
            return cachedValue;
        }


        let url = `https://api.mozambiquehe.re/bridge?auth=${this.apiKey}&player=${playerName}&platform=${platform}`;

        // Add all options to the url except already added
        for (const option in options) {
            if (option != 'player' && option != 'platform' && option != 'uuid')
                url += `&${option}=${options[option]}`;
        }

        try {
            const response = await this.http.get(url);
            this.cache.set(`player-statistics-${hash(options)}`, response.data, 10000);
            return response.data;
        }
        catch (e) {
            this.logger.error(e, playerName, platform, options);
            return {
                error: 'Error fetching player statistics: ' + e.message || 'Unknown error',
            };
        }
    }

    public async getPlayerUUIDByName(playerName: string, platform: 'PC' | 'PS4' | 'X1' | 'SWITCH') {
        const url = `https://api.mozambiquehe.re/nametouid?auth=${this.apiKey}&platform=${platform}&player=${playerName}`;

        try {
            const response = await this.http.get(url);
            return response.data;
        }
        catch (e) {
            this.logger.error(e);
            return {
                error: 'Error fetching player UUID: ' + e.message || 'Unknown error',
            };
        }
    }

    public async scrapeClubData() {
        try {
            return this.apexApiScraperService.getClubData();
        } catch (e) {
            this.logger.error(e);
            return {
                clubName: null,
                members: [],
                error: 'Error scraping club data: ' + e.message || 'Unknown error',
            };
        }
    }
}
