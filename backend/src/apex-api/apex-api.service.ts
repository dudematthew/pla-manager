import { CacheTTL, Inject, Injectable, UseInterceptors } from '@nestjs/common';
import { InjectBrowser } from 'nest-puppeteer';
import { ApexApiScraperService } from './apex-api-scraper.service';
import { Logger } from '@nestjs/common';
// import { RateLimitedAxiosInstance } from 'axios-rate-limit';
import { HttpService } from '@nestjs/axios';
import { PlayerStatisticsParamsDto } from './dtos/player-statistics-params.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import * as hash from 'object-hash';
import { PlayerStatistics } from './player-statistics.interface';
import Bottleneck from 'bottleneck';
import { Axios, AxiosInstance } from 'axios';

@Injectable()
export class ApexApiService {

    /**
     * Logger instance
     */
    private logger = new Logger('ApexApiService');

    private cacheTTL = 5000; // 5 seconds

    /**
     * Axios get method with rate limiting
     */
    private axiosGet: any;

    private apiKey = process.env.APEX_API_KEY;

    constructor(
        // private readonly apexApiScraperService: ApexApiScraperService,
        private readonly httpService: HttpService,
        @Inject(CACHE_MANAGER)
        private readonly cache: Cache,
    ) {
        this.logger.log(`Setting up ApexApiService with rate limit: ${process.env.APEX_API_RATE_LIMIT} requests per ${process.env.APEX_API_RATE_MILISECONDS_TRESHOLD} miliseconds`);

        const limiterConfig = {
            reservoir: parseInt(process.env.APEX_API_RATE_LIMIT || '1'),
            reservoirRefreshAmount: parseInt(process.env.APEX_API_RATE_LIMIT || '1'),
            reservoirRefreshInterval: parseInt(process.env.APEX_API_RATE_MILISECONDS_TRESHOLD || '2000'),

            minTime: parseInt(process.env.APEX_API_WAIT_MILISECONDS || '1200'),
            maxConcurrent: 2,
        }

        console.log('Limiter config: ', limiterConfig);

        const limiter = new Bottleneck(limiterConfig);

        this.axiosGet = limiter.wrap(this.httpService.axiosRef.get);

    }

    /**
     * Get player statistics by UID
     * @param playerUID
     * @param platform 
     * @param options 
     * @returns Player statistics
     */
    public async getPlayerStatisticsByUID(playerUID: string, platform: 'PC' | 'PS4' | 'X1' | 'SWITCH', options: PlayerStatisticsParamsDto): Promise<PlayerStatistics> {

        // Make sure options are set and defaults are set
        options.uid = options.uid || playerUID;
        options.platform = options.platform || platform;
        options.merge = options.merge || 1;
        options.removeMerged = options.removeMerged || 1;

        const hashedOptions = hash(options);
        const cachedValue = await this.cache.get(`player-statistics-${hash(options)}`);
        console.log(`Generated hash ${hashedOptions} for options: `, options);
        
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
            const response = await this.axiosGet(url);
            this.cache.set(`player-statistics-${hash(options)}`, response.data, this.cacheTTL);
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
     * @returns Player statistics or null if not found
    */
    public async getPlayerStatisticsByName(playerName: string, platform: 'PC' | 'PS4' | 'X1' | 'SWITCH', options: PlayerStatisticsParamsDto = {}): Promise<PlayerStatistics> {
       
        // Make sure options are set and defaults are set
        options.player = options.player || playerName;
        options.platform = options.platform || platform;
        options.merge = options.merge || 1;
        options.removeMerged = options.removeMerged || 1;

        const hashedOptions = hash(options);
        const cachedValue = await this.cache.get(`player-statistics-${hash(options)}`);
        console.log(`Generated hash ${hashedOptions} for options: `, options);

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
            const response = await this.axiosGet(url);

            this.cache.set(`player-statistics-${hash(options)}`, response.data, this.cacheTTL);
            return response.data;
        }
        catch (e) {
            this.logger.error(e, playerName, platform, options);
            return {
                error: 'Error fetching player statistics: ' + e.message || 'Unknown error',
                errorCode: e.response?.status,
            };
        }
    }
    
    public async getPlayerUUIDByName(playerName: string, platform: 'PC' | 'PS4' | 'X1' | 'SWITCH') {
        const url = `https://api.mozambiquehe.re/nametouid?auth=${this.apiKey}&platform=${platform}&player=${playerName}`;
        
        try {
            const response = await this.axiosGet(url);
            return response.data;
        }
        catch (e) {
            this.logger.error(e);
            return {
                error: 'Error fetching player UUID: ' + e.message || 'Unknown error',
                errorCode: e.response?.status,
            };
        }
    }

    // public async scrapeClubData() {
    //     try {
    //         return this.apexApiScraperService.getClubData();
    //     } catch (e) {
    //         this.logger.error(e);
    //         return {
    //             clubName: null,
    //             members: [],
    //             error: 'Error scraping club data: ' + e.message || 'Unknown error',
    //         };
    //     }
    // }
}
