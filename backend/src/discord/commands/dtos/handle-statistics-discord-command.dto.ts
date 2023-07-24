import { GuildMember, User } from "discord.js";
import { MemberOption, StringOption, UserOption } from "necord";

class handleStatisticsDiscordCommandDto {

    @MemberOption({
        name: 'użytkownik',
        description: 'Użytkownik na serwerze PLA którego statystyki chcesz sprawdzić',
        required: true,
    })
    user: GuildMember;
}

export { handleStatisticsDiscordCommandDto };