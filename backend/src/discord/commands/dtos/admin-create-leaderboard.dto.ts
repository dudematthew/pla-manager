import { Channel, Role, User } from "discord.js";
import { ChannelOption, RoleOption, StringOption, UserOption } from "necord";

class AdminCreateLeaderboardDto {
    @ChannelOption({
        name: 'kanał',
        description: 'Kanał na którym ma być wyświetlana tablica',
        required: false,
    })
    channel: Channel;
}

export { AdminCreateLeaderboardDto };