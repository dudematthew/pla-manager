import { Channel, Role, User } from "discord.js";
import { BooleanOption, ChannelOption, NumberOption, RoleOption, StringOption, UserOption } from "necord";

class AdminCreateRankingReportDto {
    @ChannelOption({
        name: 'kanał',
        description: 'Kanał na którym ma być wyświetlany wykaz',
        required: false
    })
    channel: Channel;

    @NumberOption({
        name: 'sezon',
        description: 'Czy wyświetlić dane z końca konkretnego sezonu?',
        required: false
    })
    season: number;
}

export { AdminCreateRankingReportDto };