import { Channel, GuildMember } from "discord.js";
import { ChannelOption, MemberOption, StringOption, UserOption } from "necord";

class handleAdminInsideCreateTeamBoardDto {

    @StringOption({
        name: "drużyna",
        description: "Nazwa drużyny, której informacje chcesz wyświetlić",
        choices: [
            {
                name: "PLA-O",
                value: "o"
            },
            {
                name: "PLA-C",
                value: "c"
            },
            {
                name: "PLA-Y",
                value: "y"
            },
            {
                name: "PLA-P",
                value: "p"
            },
            {
                name: "PLA-B",
                value: "b"
            },
            {
                name: "PLA-G",
                value: "g"
            },
            {
                name: "PLA-R",
                value: "r"
            }
        ]
    })
    team: string;

    @ChannelOption({
        name: "kanał",
        description: "Kanał na który ma zostać wysłana tablica informacyjna",
        required: false,
    })
    channel: Channel

    
}

export { handleAdminInsideCreateTeamBoardDto };