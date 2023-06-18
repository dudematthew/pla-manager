import { StringOption } from "necord";

const platformAliases = {
    'PC': 'PC',
    'Xbox': 'X1',
    'PlayStation': 'PS4',
    'Nintendo Switch': 'SWITCH'
}

class handleConnectCommandDto {
    @StringOption({
        name: 'nazwa-użytkownika',
        description: 'Nazwa użytkownika w Apex Legends',
        required: true,
    })
    username: string;

    @StringOption({
        name: 'platforma',
        description: 'Platforma na której grasz',
        required: true,
        autocomplete: false,
        choices: [
            {
                name: 'PC',
                value: 'PC'

            },
            {
                name: 'Xbox',
                value: 'X1'
            },
            {
                name: 'PlayStation',
                value: 'PS4',
            },
            {
                name: 'Nintendo Switch',
                value: 'SWITCH'
            }
        ]
    })
    platform: 'PC' | 'PS4' | 'X1' | 'SWITCH';
}

export { platformAliases, handleConnectCommandDto };