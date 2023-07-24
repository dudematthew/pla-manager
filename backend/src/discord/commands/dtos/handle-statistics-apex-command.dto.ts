import { StringOption } from "necord";

class handleStatisticsApexCommandDto {
    @StringOption({
        name: 'nazwa-użytkownika',
        description: 'Nazwa użytkownika którego statystyki chcesz sprawdzić',
        required: true,
    })
    username: string;

    @StringOption({
        name: 'platforma',
        description: 'Platforma na której gra użytkownik',
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

export { handleStatisticsApexCommandDto };