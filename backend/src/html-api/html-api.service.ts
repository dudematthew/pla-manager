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
import { Interface } from 'readline';

import { TopPlayerTemplateParams, topPlayerTemplate } from './templates/top-player';

type Parameters = TopPlayerTemplateParams;

@Injectable()
export class HtmlApiService {

    /**
     * Logger instance
     */
    private logger = new Logger('HtmlApiService');

    /**
     * TTL for cache in seconds
     * Set to a huge number because cache is going to reset
     * on every restart anyway
     */
    private cacheTTL = 12096 * 100; // two weeks

    private TemplateToHtmlCode = {
        'topPlayer': topPlayerTemplate,
    }

    /**
     * Axios get method with rate limiting
     */
    private axiosGet: any;

    /**
     * Axios post method with rate limiting
     */
    private axiosPost: any;

    private apiKey = process.env.HTML_CSS_API_KEY;
    private userId = process.env.HTML_CSS_USER_ID;

    private templates: Map<string, string> = new Map();

    constructor(
        // private readonly apexApiScraperService: ApexApiScraperService,
        private readonly httpService: HttpService,
        @Inject(CACHE_MANAGER)
        private readonly cache: Cache,
    ) {
        this.logger.log(`Setting up HtmlApi with rate limit: ${process.env.HTML_CSS_API_RATE_LIMIT} requests per ${process.env.HTML_CSS_API_RATE_MILISECONDS_TRESHOLD} miliseconds`);

        const limiterConfig = {
            reservoir: parseInt(process.env.HTML_CSS_API_RATE_LIMIT || '1'),
            reservoirRefreshAmount: parseInt(process.env.HTML_CSS_API_RATE_LIMIT || '1'),
            reservoirRefreshInterval: parseInt(process.env.HTML_CSS_API_RATE_MILISECONDS_TRESHOLD || '2000'),

            minTime: parseInt(process.env.HTML_CSS_API_WAIT_MILISECONDS || '1200'),
            maxConcurrent: 2,
        }

        console.log('Limiter config: ', limiterConfig);

        const limiter = new Bottleneck(limiterConfig);

        this.axiosGet = limiter.wrap(this.httpService.axiosRef.get);

        this.axiosPost = limiter.wrap(this.httpService.axiosRef.post);
    }

    public async getImageFromHtml(parameters: Parameters, templateName: string): Promise<string> {
        const templateHtml = this.TemplateToHtmlCode[templateName];

        // Return dummy image if environment is not production
        if (process.env.NODE_ENV !== 'production')
            return `https://images-ext-2.discordapp.net/external/7PVOP6Wco5URuf-Z1lAWp47ndAXpAglnz-9fMowykxU/https/hcti.io/v1/image/95d66153-5fc0-4f1e-a37f-b2f1e0ab337d?width=670&height=670`;

        console.log(`Code before replace (${typeof parameters}): ${templateHtml}`);

        const hashKey = hash({ parameters, templateName });

        const cachedImage = await this.cache.get(hashKey);

        if (cachedImage) {
            return cachedImage as string;
        }


        const html = this.replaceParameters(templateHtml, parameters, templateName);

        const payload = {
            html: html
        }

        let headers = { auth: {
            username: this.userId,
            password: this.apiKey,
          },
          headers: {
            'Content-Type': 'application/json'
          }
        }

        const response = await this.axiosPost('https://hcti.io/v1/image', JSON.stringify(payload), headers);

        // const imageUrl = `https://hcti.io/v1/image/6ca8ea49-9cce-48e7-a59c-d354d3fbfb40`;
        const imageUrl = response.data?.url;

        this.cache.set(hashKey, imageUrl, this.cacheTTL);

        return imageUrl;
    }

    /**
     * Replace parameters in template for each %s occurence
     * @param templateHtml 
     * @param parameters 
     */
    public replaceParameters(templateHtml: string, parameters: Parameters, templateName): string {
        const parametersArray = Object.values(parameters);

        let html = templateHtml;

        for (let i = 0; i < parametersArray.length; i++) {
            console.log('Replacing %s with %s', `%s`, parametersArray[i]);
            html = html.replace(/%s/, parametersArray[i]);
        }

        console.log('Replaced html: ', html);

        return html;
    }



}
