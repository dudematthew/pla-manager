import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import * as fs from 'fs';

import configuration from './configuration';

let envFilePath = '.env.development';
let ignoreEnvFile = false;
if (process.env.NODE_ENV === 'production') {
  // Check if .env.production exists
  if (fs.existsSync('.env.production')) {
    console.log('Using .env.production file');
    envFilePath = '.env.production';
  }
  else {
    console.log('No .env.production file found, using injected environment variables');
    ignoreEnvFile = true;
  }
} else {
  console.log('Using .env.development file');
}

@Module({
    imports: [
        NestConfigModule.forRoot({ 
            isGlobal: true,
            envFilePath,
            ignoreEnvFile,
            load: [configuration],
        }),
    ],
})
export class ConfigModule {}
