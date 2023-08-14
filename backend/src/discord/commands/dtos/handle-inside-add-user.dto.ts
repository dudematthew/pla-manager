import { GuildMember } from "discord.js";
import { MemberOption, StringOption, UserOption } from "necord";

const plaTeamToNameDictionary = {
    plao: "PLA-O",
    plac: "PLA-C",
    play: "PLA-Y",
    plap: "PLA-P",
    plab: "PLA-B",
    plag: "PLA-G",
}

class handleAdminInsideAddUserDto {

    @MemberOption({
        name: "użytkownik",
        description: "Użytkownik, którego chcesz dodać do drużyny",
    })
    member: GuildMember;

    @StringOption({
        name: "drużyna",
        description: "Nazwa drużyny, do której chcesz dodać użytkownika",
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
            }
        ]
    })
    team: string;

    @StringOption({
        name: "pozyzja",
        description: "Pozycja, którą zajmuje użytkownik w drużynie",
        choices: [
            {
                name: "Kapitan",
                value: "captain"
            },
            {
                name: "Gracz",
                value: "member"
            },
            {
                name: "Rezerwa",
                value: "reserve"
            }
        ]
    })
    position: string;
    
}

export { handleAdminInsideAddUserDto, plaTeamToNameDictionary };