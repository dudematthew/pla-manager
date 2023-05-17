import { StringOption } from "necord";

export class handleConnectCommandDto {
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
                value: 'XBOX'
            },
            {
                name: 'PlayStation',
                value: 'PS',
            },
            {
                name: 'Nintendo Switch',
                value: 'SWITCH'
            }
        ]
    })
    platform: string;
}