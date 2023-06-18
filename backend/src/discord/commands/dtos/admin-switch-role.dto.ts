import { Role, User } from "discord.js";
import { RoleOption, StringOption, UserOption } from "necord";

class AdminSwitchRoleCommandDto {
    @UserOption({
        name: 'użytkownik',
        description: 'Użytkownik Discorda',
        required: true,
    })
    user: User;

    @RoleOption({
        name: 'rola',
        description: 'Rola na Discordzie',
        required: true,
    })
    role: Role;
}

export { AdminSwitchRoleCommandDto };