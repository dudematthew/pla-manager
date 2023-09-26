import { CacheTTL, Inject, Injectable, UseInterceptors } from '@nestjs/common';
import { InjectBrowser } from 'nest-puppeteer';
import { Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import * as hash from 'object-hash';
import Bottleneck from 'bottleneck';
import { Axios, AxiosInstance } from 'axios';

@Injectable()
export class TwitchApiService {

    private logger = new Logger('TwitchApiService');

    private cacheTTL = 5000; // 5 seconds

    private axiosGet: any;

    private clientID = process.env.TWITCH_API_CLIENT_ID;
    private authToken = process.env.TWITCH_API_AUTH_TOKEN;
    private twitchApiUrl = 'https://api.twitch.tv/helix';
    private mainChannelTwitchName = 'snakebitebettyx';

    private headers = {
        'Client-ID': this.clientID,
        'Authorization': `Bearer ${this.authToken}`,
    };

    constructor(
        private readonly httpService: HttpService,
        @Inject(CACHE_MANAGER)
        private readonly cache: Cache,
    ) {
        this.logger.log(`Setting up TwitchApiService`);

        const limiterConfig = {
            reservoir: parseInt(process.env.TWITCH_API_RATE_LIMIT || '1'),
            reservoirRefreshAmount: parseInt(process.env.TWITCH_API_RATE_LIMIT || '1'),
            reservoirRefreshInterval: parseInt(process.env.TWITCH_API_RATE_MILISECONDS_TRESHOLD || '2000'),
            minTime: parseInt(process.env.TWITCH_API_WAIT_MILISECONDS || '1200'),
            maxConcurrent: 2,
        }

        console.log('Limiter config: ', limiterConfig);

        const limiter = new Bottleneck(limiterConfig);

        this.axiosGet = limiter.wrap(this.httpService.axiosRef.get);
    }

    public async getUserTwitchId (twitchUsername: string) {
        console.log('getUserTwitchId: ', twitchUsername);

        const getUserUrl = `${this.twitchApiUrl}/users?login=${twitchUsername}`;

        let userResponse;

        try {
            userResponse = await this.axiosGet(getUserUrl, { headers: this.headers });
            return userResponse.data.data[0].id;
        } catch (e) {
            this.logger.error('TwitchApiService: Failed to get user: ', e);
            throw e;
        }
    }

    /**
     * Check if given user is following given channel
     * @param twitchUsername 
     * @returns 
     */
    public async checkFollows(twitchUsername: string): Promise<{ following: boolean, id: string }> {
        
        const userId = await this.getUserTwitchId(twitchUsername);
        const broadcasterId = await this.getUserTwitchId(this.mainChannelTwitchName);
        console.info(`Got user: ${twitchUsername} with id: ${userId}`);
        
        const getFollowsUrl = `${this.twitchApiUrl}/channels/followed`;
    
        let followsResponse;

        try {
            console.log('Checking if user is following the main channel: ', twitchUsername, userId, broadcasterId);

            followsResponse = await this.axiosGet(getFollowsUrl, {
                headers: this.headers,
                params: {
                    user_id: userId,
                    broadcaster_id: broadcasterId,
                },
            });

            const follows = followsResponse.data.data;

            console.info(follows);

            if (follows.length > 0) {
                console.log(`${twitchUsername} is following the main channel`);
                return {
                    following: true,
                    id: userId,
                };
            } else {
                console.log(`${twitchUsername} is not following the main channel`);
                return {
                    following: false,
                    id: userId,
                };
            } 
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    /**
     * Check if given channel has a user as a follower
     */
    public async getFollowed (twitchUsername: string): Promise<{ following: boolean, id: string }> {
        const userId = await this.getUserTwitchId(twitchUsername);
        const broadcasterId = await this.getUserTwitchId(this.mainChannelTwitchName);
        console.info(`Got user: ${twitchUsername} with id: ${userId}`);

        const getFollowsUrl = `${this.twitchApiUrl}/channels/followers`;

        let followsResponse;

        try {
            followsResponse = await this.axiosGet(getFollowsUrl, {
                headers: this.headers,
                params: {
                    user_id: userId,
                    broadcaster_id: broadcasterId,
                },
            });

            const follows = followsResponse.data.data;

            console.log(followsResponse.data);

            if (follows.length > 0) {
                console.log(`${twitchUsername} is following the main channel`);
                return {
                    following: true,
                    id: userId,
                };
            } else {
                console.log(`${twitchUsername} is not following the main channel`);
                return {
                    following: false,
                    id: userId,
                };
            }
        } catch (e) {
            console.error(e);
            return null;
        }
    }
}
