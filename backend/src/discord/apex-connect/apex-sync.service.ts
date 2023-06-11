import { Injectable, Logger } from "@nestjs/common";
import { ApexApiService } from "src/apex-api/apex-api.service";
import { DiscordService } from "src/discord/discord.service";
import { ApexAccountService } from "src/database/entities/apex-account/apex-account.service";
import { RoleService } from "src/database/entities/role/role.service";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class ApexSyncService {

    private logger = new Logger(ApexSyncService.name);
    
    constructor (
        private readonly discordService: DiscordService,
        private readonly apexApiService: ApexApiService,
        private readonly apexAccountService: ApexAccountService,
        private readonly roleService: RoleService,
        private readonly configService: ConfigService,
    ) {}

    /**
   * Remove disconnected role from every user
   * that doesn't have connected Apex Account and
   * give disconnected role to every user that doesn't have it
   */
  public async updateDisconnectedRoles() {
    const disconnectRole = await this.roleService.findByName(this.configService.get<string>('role-names.disconnected'));

    if (!disconnectRole) {
      this.logger.error('Disconnected role not found');
      return;
    }

    // Get all users with connected Apex Account
    const usersWithConnectedApexAccount = await this.apexAccountService.findAll();

    // Get all users in the main guild
    const users = await this.discordService.guild.members.fetch();

    // Remove disconnected role from every user that has connected Apex Account
    for (const user of users.values()) {
      if (usersWithConnectedApexAccount.some(apexAccount => apexAccount.user.discordId === user.id)) {
        await this.discordService.removeRoleFromUser(user.id, disconnectRole.discordId);
      }
      // Else give user disconnected role
      else if (!user.roles.cache.has(disconnectRole.discordId)) {
        await this.discordService.addRoleToUser(user.id, disconnectRole.discordId);
      }
    }
  }

  /**
   * Update roles for every user that has connected Apex Account
   */
    public async updateConnectedRoles() {
        
    }

    /**
     * Update Apex Account of every connected user
     */
    public async updateConnectedAccounts() {
        
    }
}