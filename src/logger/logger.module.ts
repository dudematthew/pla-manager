import { WinstonModule } from 'nest-winston';
import { Module } from '@nestjs/common';
import * as winston from 'winston';

/**
 * Logger module
 * @export LoggerModule class that imports WinstonModule
 *  and configures the logger
 * 
 * Available log levels:
 * emerg: 0 - system is unusable
 * alert: 1 - action must be taken immediately
 * crit: 2 - critical conditions
 * error: 3 - error conditions
 * warning: 4 - warning conditions
 * notice: 5 - normal but significant condition
 * info: 6 - informational messages
 * debug: 7 - debug-level messages
 */
@Module({
  imports: [
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
          ),
          level: (process.env.NODE_ENV == 'production') ? 'error' : 'debug',
        }),
        new winston.transports.File({
          filename: process.env.ERROR_LOG_FILE_PATH || 'error.log',
          format: winston.format.combine(
            winston.format.timestamp({
              format: 'DD-MM-YYYY HH:mm:ss',
            }),
            winston.format.label({ label: winston.level }),
            winston.format.prettyPrint(),
          ),
          level: 'error',
        }),
      ],
    }),
  ],
})
export class LoggerModule {}
