import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Observable } from "rxjs";
import { ChatInputCommandInteraction, GuildMember, Message, PermissionsBitField } from "discord.js";
import { NecordExecutionContext } from "necord";

@Injectable()
export class AdminGuard implements CanActivate {
    async canActivate(context: NecordExecutionContext): Promise<boolean> {
        
        const interaction: ChatInputCommandInteraction = context.getArgs()[0][0] as ChatInputCommandInteraction;

        const guildMember: GuildMember = await interaction.guild.members.fetch(interaction.user.id);

        let hasPermission = (!guildMember) ? false : guildMember.permissions.has(PermissionsBitField.Flags.Administrator);

        return hasPermission;
    }
}