declare namespace NodeJS {
    export interface processEnv {
        // SERVER ---------------------------------------
        /**
         * SESSION_SECRET - Secret used to sign the session ID cookie
         */
        SESSION_SECRET: string;
        /**
         * ADMIN_PASSWORD - Password used to access admin panel (not used currently)
         */
        ADMIN_PASSWORD: string;
        /**
         * PORT - Port number to run the server on
         */
        PORT: string;

        // DATABASE -------------------------------------
        /**
         * DB_HOST - Database host
         */
        DB_HOST?: string;
        /**
         * DB_PORT - Database port
         */
        DB_PORT?: string;
        /**
         * DB_USER - Database user
         */
        DB_USER?: string;
        /**
         * DB_PASS - Database password
         */
        DP_PASS?: string;
        /**
         * DB_NAME - Database name
         */
        DB_NAME?: string;

        // FOREST ADMIN ---------------------------------
        /**
         * FOREST_ENV_SECRET - Forest environment secret
         */
        FOREST_ENV_SECRET?: string;
        /**
         * FOREST_AUTH_SECRET - Forest auth secret
         */
        FOREST_AUTH_SECRET?: string;

        // APEX LEGENDS STATUS API ----------------------
        /**
         * APEX_API_KEY - API key for the Apex Legends Status API
         */
        APEX_API_KEY?: string;
        /**
         * APEX_API_RATE_LIMIT - Rate limit for the Apex Legends Status API
         */
        APEX_API_RATE_LIMIT?: string;
        /**
         * APEX_API_RATE_MILISECONDS_TRESHOLD - Rate limit treshold for the Apex Legends Status API
         */
        APEX_API_RATE_MILISECONDS_TRESHOLD?: string;
        /**
         * APEX_API_WAIT_MILISECONDS - Wait time for the Apex Legends Status API
         */
        APEX_API_WAIT_MILISECONDS?: string;

        // APEX TRACKER API -----------------------------
        /**
         * APEX_TRACKER_API_KEY - API key for the Apex Tracker API
         */
        APEX_TRACKER_API_KEY?: string;
        /**
         * APEX_TRACKER_API_RATE_LIMIT - Rate limit for the Apex Tracker API
         */
        APEX_TRACKER_API_RATE_LIMIT?: string;
        /**
         * APEX_TRACKER_API_RATE_MILISECONDS_TRESHOLD - Rate limit treshold for the Apex Tracker API
         */
        APEX_TRACKER_API_RATE_MILISECONDS_TRESHOLD?: string;
        /**
         * APEX_TRACKER_API_WAIT_MILISECONDS - Wait time for the Apex Tracker API
         */
        APEX_TRACKER_API_WAIT_MILISECONDS?: string;

        // HTML CSS API ---------------------------------
        /**
         * HTML_CSS_USER_ID - User ID for the HTML CSS API
         */
        HTML_CSS_USER_ID?: string;
        /**
         * HTML_CSS_API_KEY - API key for the HTML CSS API
         */
        HTML_CSS_API_KEY?: string;
        /**
         * HTML_CSS_API_RATE_LIMIT - Rate limit for the HTML CSS API
         */
        HTML_CSS_API_RATE_LIMIT?: string;
        /**
         * HTML_CSS_API_RATE_MILISECONDS_TRESHOLD - Rate limit treshold for the HTML CSS API
         */
        HTML_CSS_API_RATE_MILISECONDS_TRESHOLD?: string;
        /**
         * HTML_CSS_API_WAIT_MILISECONDS - Wait time for the HTML CSS API
         */
        HTML_CSS_API_WAIT_MILISECONDS?: string;

        // DISCORD --------------------------------------
        /**
         * DISCORD_TOKEN - Discord bot token
         */
        DISCORD_TOKEN?: string;
        /**
         * MAIN_GUILD_ID - Discord guild that the bot is used on
         */
        MAIN_GUILD_ID?: string;
        /**
         * DISCORD_CLIENT_ID - Discord client ID
         */
        DISCORD_CLIENT_ID?: string;
        /**
         * DISCORD_CLIENT_SECRET - Discord client secret for OAuth2
         */
        DISCORD_CLIENT_SECRET?: string;
        /**
         * DISCORD_REDIRECT_URL - Discord redirect URL for OAuth2
         */
        DISCORD_REDIRECT_URL?: string;
        /**
         * DISCORD_MAIN_ADMIN_ID - Discord ID of the main admin
         */
        DISCORD_MAIN_ADMIN_ID?: string;
        
        // lOGGING
        /**
         * ENABLE_LOGGING - Enable logging to file
         */
        ENABLE_LOGGING?: string;
        /**
         * LOG_FILE_PATH - Path to the log file
         */
        ERROR_LOG_FILE_PATH?: string;
        
        // ENVIRONMENT
        /**
         * ENVIRONMENT - Environment the server is running in
         */
        ENVIRONMENT?: Environment;
    }
    export type Environment = 'DEVELOPMENT' | 'PRODUCTION' | 'TEST';
}