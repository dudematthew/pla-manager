import { CacheTTL, Inject, Injectable, UseInterceptors } from '@nestjs/common';
import { InjectBrowser } from 'nest-puppeteer';
import { Logger } from '@nestjs/common';
// import { RateLimitedAxiosInstance } from 'axios-rate-limit';
import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import * as hash from 'object-hash';
import Bottleneck from 'bottleneck';
import { Axios, AxiosInstance } from 'axios';
import { ApexSeason } from './apex-season-interface';
import { ApexCurrentSeason } from './apex-current-season-interface';

@Injectable()
export class ApexSeasonApiService {

    /**
     * Logger instance
     */
    private logger = new Logger('ApexSeasonApiService');

    private cacheTTL = (1000 * 60 * 60 * 24); // 1 day

    /**
     * Axios get method with rate limiting
     */
    private axiosGet: any;

    constructor(
        // private readonly apexApiScraperService: ApexApiScraperService,
        private readonly httpService: HttpService,
        @Inject(CACHE_MANAGER)
        private readonly cache: Cache,
    ) {
        // const limiterConfig = {
        //     reservoir: parseInt(process.env.APEX_API_RATE_LIMIT || '1'),
        //     reservoirRefreshAmount: parseInt(process.env.APEX_API_RATE_LIMIT || '1'),
        //     reservoirRefreshInterval: parseInt(process.env.APEX_API_RATE_MILISECONDS_TRESHOLD || '2000'),

        //     minTime: parseInt(process.env.APEX_API_WAIT_MILISECONDS || '1200'),
        //     maxConcurrent: 2,
        // }

        // console.log('Limiter config: ', limiterConfig);

        // const limiter = new Bottleneck(limiterConfig);

        // this.axiosGet = limiter.wrap(this.httpService.axiosRef.get);

        this.axiosGet = this.httpService.axiosRef.get;

    }
    
    /**
     * Get current season
     * @returns current season
     */
    public async getCurrentSeason (): Promise<ApexCurrentSeason> {

        console.info(`Attention! Got request for current season.`);

        const cachedValue = await this.cache.get<ApexCurrentSeason>(`api-current-season`);

        if (cachedValue) {
            return cachedValue;
        }

        try {
            const response = await this.axiosGet(`https://api.jumpmaster.xyz/seasons/Current`);
            this.cache.set(`api-current-season`, response.data, this.cacheTTL);
            return response.data;
        } catch (e) {
            this.logger.error(e);
            return {
                error: 'Error fetching current season: ' + e.message || 'Unknown error',
            };
        }
    }

    /**
     * Get season by number
     * @param season season number
     */
    public async getSeason (season: number): Promise<ApexSeason> {
        
        console.info(`Attention! Got request for season ${season}.`);

        const cachedValue = await this.cache.get<ApexSeason>(`api-season-${season}`);

        if (cachedValue) {
            return cachedValue;
        }

        try {
            const response = await this.axiosGet(`https://api.jumpmaster.xyz/seasons/Info?season=${season}`);
            this.cache.set(`api-season-${season}`, response.data, this.cacheTTL);
            return response.data;
        }
        catch (e) {
            this.logger.error(e);
            return {
                error: 'Error fetching season: ' + e.message || 'Unknown error',
            };
        }
    }
}
