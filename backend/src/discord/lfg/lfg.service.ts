import { Injectable, forwardRef } from '@nestjs/common';
import { MessageData } from '../discord.listeners';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { RoleService } from 'src/database/entities/role/role.service';
import { Cache } from 'cache-manager';

@Injectable()
export class LfgService {

    /**
     * The wildcard-match module
     */
    private readonly wcmatch: any;

    /**
     * The role types that are used in the lfg messages
     */
    private roleTypes = {
        bronze: [
            'bronze',
            'brąz',
            'bronz',
            'bronzu',
            'bronzem',
        ],
        silver: [
            'silver',
            'srebro',
            'srebrze',
        ],
        gold: [
            'gold',
            'goldem',
            'goldzie',
            'złoto',
            'złocie',
            'złotem',
        ],
        platinum: [
            'platinum',
            'platyna',
            'platyne',
            'platynę',
            'platyną',
            'platynie',
        ],
        diamond: [
            'diamond',
            'diament',
            'diamenta',
            'diamentem',
        ],
        master: [
            'master',
            'mastera',
            'masterem',
        ],
        predator: [
            'predator',
            'predatorem',
            'predatora',
            'pred',
            'predy',
            'predem',
        ],
    }

    constructor(
        @Inject(CACHE_MANAGER)
        private readonly cache: Cache,
        @Inject(forwardRef(() => RoleService))
        private readonly roleService: RoleService,
    ) {
        this.wcmatch = require('wildcard-match');
    }

    /**
     * This method handles the lfg message
     * It checks if the message contains any of the role types
     * and then creates a new lfg message that mentions mentioned roles
     * Every post is cached for 5 minutes to prevent spam
     * @param message 
     */
    public handleLfgMessage(message: MessageData) {
        console.log(`LFG message received: ${message.message.content}`);
        
        const messageContent = message.message.content.toLowerCase();

        // Check if the message contains any of the role types

    }

    private getMentionedRolesIds(messageContent: string) {
        const mentionedRolesIds = [];

        

        return mentionedRolesIds;
    }

    private async getRoleIdFromDatabase(roleName: string) {
        const role = await this.roleService.findByName(roleName);

        return role.id;
    }
}
