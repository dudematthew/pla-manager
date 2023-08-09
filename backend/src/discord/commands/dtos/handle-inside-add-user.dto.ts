import { StringOption, UserOption } from "necord";

class handleAdminInsideAddUserDto {

    @UserOption({
        name: "użytkownik",
        description: "Użytkownik, którego chcesz dodać do drużyny",
    })
    user: string;

    @StringOption({
        name: "drużyna",
        description: "Nazwa drużyny, do której chcesz dodać użytkownika",
        choices: [
            {
                name: "PLA-O",
                value: "plao"
            },
            {
                name: "PLA-C",
                value: "plac"
            },
            {
                name: "PLA-Y",
                value: "play"
            },
            {
                name: "PLA-P",
                value: "plap"
            },
            {
                name: "PLA-B",
                value: "plab"
            },
            {
                name: "PLA-G",
                value: "plag"
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

export { handleAdminInsideAddUserDto };