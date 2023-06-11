import { Injectable, Logger } from "@nestjs/common";
import { ApexApiService } from "src/apex-api/apex-api.service";
import { DiscordService } from "src/discord/discord.service";
import { ApexAccountService } from "src/database/entities/apex-account/apex-account.service";
import { RoleService } from "src/database/entities/role/role.service";
import { ConfigService } from "@nestjs/config";
import { SlashCommandContext } from "necord";
import { CacheType, ChatInputCommandInteraction, User } from "discord.js";
import { RoleGroupService } from "src/database/entities/role-group/role-group.service";
import { UserService } from "src/database/entities/user/user.service";
import { UserEntity } from "src/database/entities/user/user.entity";
import { sleepAwait } from 'sleep-await';

@Injectable()
export class ApexSyncService {

    private logger = new Logger(ApexSyncService.name);

    constructor (
        private readonly discordService: DiscordService,
        private readonly apexApiService: ApexApiService,
        private readonly apexAccountService: ApexAccountService,
        private readonly roleService: RoleService,
        private readonly configService: ConfigService,
        private readonly roleGroupService: RoleGroupService,
        private readonly userService: UserService,
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
      return false;
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

    return true;
  }

  public async handleAdminUpdateConnectedRole (Interaction: ChatInputCommandInteraction<CacheType>) {
    Interaction.reply({ content: 'Rozpoczynam aktualizację ról...', ephemeral: true });

    const isDone = await this.updateConnectedRoles();

    if (!isDone) {
        Interaction.editReply({ content: 'Wystąpił błąd podczas aktualizacji ról!'});
        return false;
    }

    Interaction.editReply({ content: 'Usuwanie niepołączonych ról...'});

    await this.updateDisconnectedRoles();

    Interaction.editReply({ content: 'Zakończono aktualizację ról!'});
    return true;
  }

  /**
   * Update roles for every user that has connected Apex Account
   */
    public async updateConnectedRoles() {

        // Get all users with connected Apex Account
        const usersWithConnectedApexAccount = await this.apexAccountService.findAll();

        // Get all users in the main guild
        const users = await this.discordService.guild.members.fetch();

        // Create a fusion of discord users and users with connected Apex Account
        const usersWithConnectedApexAccountAndDiscord = await Promise.all(usersWithConnectedApexAccount
            .filter(apexAccount => users.has(apexAccount.user.discordId))
            .map(async apexAccount => {
                return {
                    ...apexAccount,
                    discordUser: users.get(apexAccount.user.discordId),
                    roleToGive: await this.apexAccountService.getRoleByAccountId(apexAccount.id),
                }
            }
        ));

        // Check if RoleGroup with name 'rank' exists
        const rankRoleGroup = await this.roleGroupService.findByName('rank');

        if (!rankRoleGroup) {
            this.logger.error('RoleGroup with name \'rank\' not found');
            return false;
        }

        // Update roles for every user
        for (const user of usersWithConnectedApexAccountAndDiscord) {
            if (!user.discordUser) {
                continue;
            }

            // If user doesn't have role that he should have, give it to him
            if (!user.discordUser.roles.cache.has(user.roleToGive.discordId)) {
                await this.discordService.switchRoleFromGroup(user.discordUser.id, 'rank', user.roleToGive.discordId);
            }
        }

        return true;
    }

    /**
     * Update roles for user based on his Apex Account
     * Includes removing disconnected role
     * @param userId 
     * @returns 
     */
    public async updateAllConnectedRolesForUser(userId: UserEntity["id"]) {

        const user = await this.userService.findById(userId);
        const disconnectRole = await this.roleService.findByName(this.configService.get<string>('role-names.disconnected'));

        if (!user) {
            this.logger.error(`User with id ${userId} not found`);
            return false;
        }

        
        // Get user connected Apex Account
        const apexAccount = user?.apexAccount;

        // If user doesn't have connected Apex Account, remove all roles from him
        // and give him disconnected role
        if (!apexAccount) {
            this.discordService.removeGroupRoles(user.discordId, 'rank');
            this.discordService.addRoleToUser(user.discordId, disconnectRole.discordId);
            return true;
        }

        // Get user discord user
        const discordUser = await this.discordService.guild.members.fetch(user.discordId);

        // Get role to give
        const roleToGive = await this.apexAccountService.getRoleByAccountId(apexAccount.id);

        // Check if RoleGroup with name 'rank' exists
        const rankRoleGroup = await this.roleGroupService.findByName('rank');

        if (!rankRoleGroup) {
            this.logger.error('RoleGroup with name \'rank\' not found');
            return false;
        }

        // If user doesn't have role that he should have, give it to him
        if (!discordUser.roles.cache.has(roleToGive.discordId)) {
            await this.discordService.switchRoleFromGroup(discordUser.id, 'rank', roleToGive.discordId);
        }

        // If user has disconnected role, remove it
        if (discordUser.roles.cache.has(disconnectRole.discordId)) {
            await this.discordService.removeRoleFromUser(discordUser.id, disconnectRole.discordId);
        }

        return true;
    }

    /**
     * Update Apex Account of every connected user
     */
    public async updateConnectedAccounts(): Promise<boolean> {
        // Get all users with connected Apex Account
        const usersWithConnectedApexAccount = await this.apexAccountService.findAll();

        // Get all users in the main guild
        const discordUsers = await this.discordService.guild.members.fetch();

        // Create a fusion of discord users and users with connected Apex Account
        const connectedUsersInTheGuild = usersWithConnectedApexAccount
            .filter(apexAccount => discordUsers.has(apexAccount.user.discordId))
            .map(apexAccount => {
                return {
                    ...apexAccount,
                    discordUser: discordUsers.get(apexAccount.user.discordId),
                }
            });

        console.log(`Connected users in the guild: ${connectedUsersInTheGuild.length}. Starting update...`);

        const benchmarkStart = Date.now();

        // Update Apex Account for every user
        for (const key in connectedUsersInTheGuild) {
            const user = connectedUsersInTheGuild[key];
            
            if (!user.discordUser) {
                continue;
            }

            const benchmarkStart = Date.now();

            let apexAccount;

            // Try 3 times to update Apex Account for user
            // If it fails, log error and stop whole process
            let i = 0;
            do {
                console.log(`Updating Apex Account for ${user.discordUser.displayName} [${parseInt(key) + 1}/${connectedUsersInTheGuild.length}]`);
    
                // Get user Apex Account
                apexAccount = await this.apexApiService.getPlayerStatisticsByUID(user.uid, user.platform as any, {});
    
                // Check if Apex Account has no errors
                if (apexAccount.error) {
                    this.logger.error(`Error while trying to get Apex Account for ${user.discordUser.displayName}: ${apexAccount.error}`);
                    if (i < 3) {
                        await sleepAwait(2000);
                        this.logger.verbose(`Trying again [${i + 1}/3]`);
                        i++;
                        continue;
                    } else {
                        this.logger.error(`Tried 3 times. Stopping...`);
                        return false;
                    }
                }
            } while (apexAccount?.error)
            

            const done = this.apexAccountService.saveAccount(apexAccount, user.user);

            if (!done) {
                this.logger.error(`Error while updating Apex Account for ${user.discordUser.displayName}`);
                return false;
            }

            console.log(`Updated Apex Account for ${user.discordUser.displayName}. Took ${Date.now() - benchmarkStart}ms`);
        }

        this.logger.verbose(`Updated Apex Account for ${connectedUsersInTheGuild.length} users. Took ${Date.now() - benchmarkStart}ms`);

        // Update Roles for every user
        return await this.updateConnectedRoles();
    }

    public async handleAdminUpdateConnectedAccounts(Interaction: ChatInputCommandInteraction<CacheType>) {
        Interaction.reply({ content: 'Rozpoczynam aktualizację kont...', ephemeral: true });

        const isDone = await this.updateConnectedAccounts();

        if (!isDone) {
            Interaction.editReply({ content: 'Wystąpił błąd podczas aktualizacji kont!'});
            return false;
        }

        Interaction.editReply({ content: 'Zakończono aktualizację kont!'});
        return true;
    }
}