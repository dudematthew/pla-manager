import axios from 'axios';
import { error } from 'console';

export default class TwitchTester {
    private clientID = 'gp762nuuoqcoxypju8c569th9wz7q5';
    private refreshToken = '1rkxznb0ovf8t8eam33id4gut69m8bd3b65jqz4388fktgj05m';
    private authToken = 'mlshhx6j1mipk0yv64hdgt5p3i28gn';
    private twitchApiUrl = 'https://api.twitch.tv/helix';
    private mainChannelTwitchName = 'snakebitebettyx';

    private headers = {
        'Client-ID': this.clientID,
        'Authorization': `Bearer ${this.authToken}`,
    };

    constructor() {
        console.log('TwitchTester');
    }

    public async getUserTwitchId (twitchUsername) {
        console.log('getUserTwitchId: ', twitchUsername);
        const headers = this.headers;

        const getUserUrl = `https://api.twitch.tv/helix/users?login=${twitchUsername}`;

        let userResponse;

        try {
            userResponse = await axios.get(getUserUrl, { headers });
        } catch (e) {
            throw new error('TwitchTester: Failed to get user: ', e);
        }

        const user = userResponse.data.data[0];

        return user.id;
    }

    public async checkFollows(twitchUsername: string) {
        
        const headers = this.headers;
        
        const userId = await this.getUserTwitchId(twitchUsername);
        const broadcasterId = await this.getUserTwitchId(this.mainChannelTwitchName);
        console.info(`Got user: ${twitchUsername} with id: ${userId}`);
        
        const getFollowsUrl = `https://api.twitch.tv/helix/channels/followed`;
    
        let followsResponse;

        try {
            followsResponse = await axios.get(getFollowsUrl, {
                headers,
                params: {
                    user_id: userId,
                    broadcaster_id: broadcasterId,
                },
            });
        } catch (e) {
            throw new Error('TwitchTester: Failed to get follows: ', e);
        }
    
        const follows = followsResponse.data.data;

        console.info(follows);

        if (follows.length > 0) {
            console.log(`${twitchUsername} is following the main channel`);
            return true;
        } else {
            console.log(`${twitchUsername} is not following the main channel`);
            return false;
        } 
    }
}
