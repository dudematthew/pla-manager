import { Injectable } from "@nestjs/common";
import mysqldump, { ConnectionOptions, DumpReturn, Options } from 'mysqldump';
import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import fs from 'fs';
import { DiscordService } from "src/discord/discord.service";
import { throwError } from "rxjs";
import { Attachment, AttachmentBuilder, BufferResolvable } from "discord.js";
const zlib = require('zlib');

@Injectable()
export class DatabaseService {

    private mysqlDumpConfig: ConnectionOptions;

    private logger = new Logger(DatabaseService.name);

    constructor(
        private readonly configService: ConfigService,
        private readonly discordService: DiscordService,
    ) {
        this.mysqlDumpConfig = {
            host: configService.get<string>('DB_HOST', 'localhost'),
            user: configService.get('DB_USER', 'root'),
            password: configService.get('DB_PASS', ''),
            database: configService.get('DB_NAME', 'pla_manager'),
            port: configService.get<number>('DB_PORT', 3306),
        }
    }

    public async getDatabaseBackup(): Promise<DumpReturn> {
        const config: Options = {
            connection: this.mysqlDumpConfig,
        }

        return await mysqldump(config);
    }

    /**
     * Backs up the database to a file
     * and sends it as a discord message 
     * to the main admin
     */
    public async backupDatabase(): Promise<boolean> {
        let dump: DumpReturn;

        try {
            dump = await this.getDatabaseBackup();
        } catch (e) {
            this.logger.error(`Database backup failed! ${e.message}`, e.stack);
            this.discordService.sendErrorToLogChannel(e);
            return false;
        }
        this.logger.log(`Database backup done! [${dump.dump.data.length} bytes]}]`);

        const date = new Date();

        const dateString = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;

        const filename = `pla-backup-${dateString}.sql`;

        await this.sendBackupToAdmin(dump, filename);

        return true;
    }

    public async sendBackupToAdmin(backup: DumpReturn, filename: string): Promise<boolean> {

        await this.discordService.isReady();
        
        const mainAdminId = this.configService.get<string>('DISCORD_MAIN_ADMIN_ID', '426330456753963008');
    
        // Compress the SQL dump
        const compressedDump = zlib.gzipSync(backup.dump.data);
    
        const attachment = new AttachmentBuilder(compressedDump, {
            name: filename + '.gz', // Add .gz extension for the compressed file
            description: 'Backup bazy danych',
        }) // .setSpoiler(true)
    
        // Send backup message to user 426330456753963008
        this.discordService.sendPrivateMessage(mainAdminId, `Backup bazy danych został wykonany! [${compressedDump.length} bajtów]`, [], [], [
            attachment,
        ]);
    
        return true;
    }
    
}