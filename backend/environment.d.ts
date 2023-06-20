declare namespace NodeJS {
    export interface processEnv {
        SESSION_SECRET: string;
        ADMIN_PASSWORD: string;
        PORT: string;

        // DATABASE
        DB_HOST?: string;
        DB_PORT?: string;
        DB_USER?: string;
        DP_PASS?: string;
        DB_NAME?: string;

        // FOREST ADMIN
        FOREST_ENV_SECRET?: string;
        FOREST_AUTH_SECRET?: string;

        // APEX LEGENDS STATUS API
        APEX_API_KEY?: string;
        APEX_API_RATE_LIMIT?: string;
        APEX_API_RATE_MILISECONDS_TRESHOLD?: string;
        APEX_API_WAIT_MILISECONDS?: string;

        // APEX TRACKER API
        APEX_TRACKER_API_KEY?: string;
        APEX_TRACKER_API_RATE_LIMIT?: string;
        APEX_TRACKER_API_RATE_MILISECONDS_TRESHOLD?: string;
        APEX_TRACKER_API_WAIT_MILISECONDS?: string;

        // DISCORD
        DISCORD_TOKEN?: string;
        MAIN_GUILD_ID?: string;
        DISCORD_CLIENT_ID?: string;
        DISCORD_CLIENT_SECRET?: string;
        DISCORD_REDIRECT_URL?: string;
        DISCORD_MAIN_ADMIN_ID?: string;
        
        // lOGGING
        ENABLE_LOGGING?: string;
        ERROR_LOG_FILE_PATH?: string;
        
        // ENVIRONMENT
        ENVIRONMENT?: Environment;
    }
    export type Environment = 'DEVELOPMENT' | 'PRODUCTION' | 'TEST';
}