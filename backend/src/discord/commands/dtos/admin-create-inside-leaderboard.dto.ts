import { Channel, Role, User } from "discord.js";
import { ChannelOption, RoleOption, StringOption, UserOption } from "necord";

class AdminCreateInsideLeaderboardDto {
    @ChannelOption({
        name: 'kanał',
        description: 'Kanał na którym ma być wyświetlana tablica',
        required: false,
    })
    channel: Channel;

    @StringOption({
        name: 'typ',
        description: 'Typ tablicy wyników',
        choices: [
            {
                name: 'Drużyny',
                value: 'team',
            },
            {
                name: 'Członkowie',
                value: 'member',
            }
        ]
    })
    type: 'team' | 'member';
}

export { AdminCreateInsideLeaderboardDto };