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
                name: 'Drużyny LP',
                value: 'lp-team',
            },
            {
                name: 'Członkowie LP',
                value: 'lp-member',
            },
            {
                name: 'Drużyny Aktywność',
                value: 'activity-team',
            },
            {
                name: 'Członkowie Aktywność',
                value: 'activity-member',
            }
        ]
    })
    type: 'lp-team' | 'lp-member' | `activity-team` | `activity-member`;
}

export { AdminCreateInsideLeaderboardDto };