import { StringOption, UserOption } from "necord";

class handleStatisticsDiscordCommandDto {

    @UserOption({
        name: 'użytkownik',
        description: 'Użytkownik na serwerze PLA którego statystyki chcesz sprawdzić',
        required: true,
    })
    user: string;
}

export { handleStatisticsDiscordCommandDto };