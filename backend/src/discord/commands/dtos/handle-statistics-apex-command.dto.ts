import { StringOption } from "necord";

class handleStatisticsApexCommandDto {
    @StringOption({
        name: 'użytkownik',
        description: 'Użytkownik na serwerze PLA którego statystyki chcesz sprawdzić',
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

    @StringOption({
        name: 'nazwa-użytkownika',
        description: 'Alternatywnie możesz podać nazwę użytkownika na Origin',
        required: true,
    })
    username: string;
}

export { handleStatisticsApexCommandDto };