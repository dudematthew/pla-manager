import { Injectable } from "@nestjs/common";
import { handleAdminInsideAddUserDto, plaTeamToNameDictionary } from "../commands/dtos/handle-inside-add-user.dto";
import { CacheType, ChatInputCommandInteraction } from "discord.js";
import { RoleService } from "src/database/entities/role/role.service";
import { DiscordService } from "../discord.service";
import { EmojiService } from "src/database/entities/emoji/emoji.service";
import { RoleEntity } from "src/database/entities/role/entities/role.entity";

@Injectable()
export class manageMembersService {

    constructor (
        private readonly roleService: RoleService,
        private readonly discordService: DiscordService,
        private readonly emojiService: EmojiService,
    ) {}

    public async handleAdminAddMember (interaction: ChatInputCommandInteraction<CacheType>, options: handleAdminInsideAddUserDto) {
        await interaction.deferReply();
        const teamName = `pla${options.team}`;
        const teamRoleName = `plainsideteam${options.team}`;

        const member = await this.discordService.getMemberById(options.member.user.id);

        if (!member) {
            await interaction.editReply('## :x: Nie znaleziono użytkownika');
            return;
        }

        const insideRole = await this.roleService.findByName('plainside');
        const captainRole = await this.roleService.findByName('plainsidecaptain');
        const reserveRole = await this.roleService.findByName('plainsidereserve');
        const teamRole = await this.roleService.findByName(teamRoleName);

        if (!insideRole) {
            await interaction.editReply('## :x: Nie znaleziono roli PLA Inside');
            return;
        }

        if (!captainRole) {
            await interaction.editReply('## :x: Nie znaleziono roli PLA Inside Captain');
            return;
        }

        if (!reserveRole) {
            await interaction.editReply('## :x: Nie znaleziono roli PLA Inside Reserve');
            return;
        }

        if (!teamRole) {
            await interaction.editReply('## :x: Nie znaleziono roli drużyny');
            return;
        }

        const memberRoles = member.roles.cache;

        if (memberRoles.has(insideRole.discordId)) {
            await interaction.editReply('## :x: Użytkownik należy już do PLA Inside, kontynować?');
            return;
        }

        // Add member to PLA Inside
        await member.roles.add(insideRole.discordId);

        // Add member to team
        if (memberRoles.has(teamRole.discordId))
            await member.roles.add(teamRole.discordId);

        // Add member to captain or reserve
        if (options.position === 'captain' && !memberRoles.has(captainRole.discordId))
            await member.roles.add(captainRole.discordId);

        if (options.position === 'reserve' && !memberRoles.has(reserveRole.discordId))
            await member.roles.add(reserveRole.discordId);

        // Write private message to user
        const welcomeMessage = await this.getWelcomeMessage(options);
        await member.user.send(welcomeMessage);
    }

    public async getWelcomeMessage (options: handleAdminInsideAddUserDto) {
        const teamEmoji = await this.emojiService.findByName(`pla${options.team}`);
        const insideEmoji = await this.emojiService.findByName('plainside');
        const teamName = plaTeamToNameDictionary[`pla${options.team}`];

        console.log(teamEmoji, teamEmoji.toString());

        const message = [
            `# Witaj w **PLA Inside!** ${insideEmoji}`,
            `## Zostałeś dodany do drużyny **${teamName}** ${teamEmoji}`,
        ];

        return {
            content: message.join('\n'),
            embeds: []
        }
    }
}