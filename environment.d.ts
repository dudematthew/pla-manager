declare namespace NodeJS {
    export interface processEnv {
        SESSION_SECRET: string;
        DB_HOST?: string;
        DB_PORT?: string;
        DB_USER?: string;
        DP_PASS?: string;
        DB_NAME?: string;
        // DISCORD
        DISCORD_TOKEN?: string;
        MAIN_GUILD_ID?: string;
        DISCORD_CLIENT_ID?: string;
        DISCORD_CLIENT_SECRET?: string;
        DISCORD_REDIRECT_URL?: string;
        // lOGGING
        ENABLE_LOGGING?: string;
        ERROR_LOG_FILE_PATH?: string;
        // ENVIRONMENT
        ENVIRONMENT?: Environment;
    }
    export type Environment = 'DEVELOPMENT' | 'PRODUCTION' | 'TEST';
}