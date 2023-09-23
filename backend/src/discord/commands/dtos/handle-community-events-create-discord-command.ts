import { Attachment, GuildMember, User } from "discord.js";
import { AttachmentOption, MemberOption, StringOption, UserOption } from "necord";

class handleCommunityEventCreateDiscordCommandDto {

    @StringOption({
        name: 'tytuł',
        description: 'Tytuł twojego wydarzenia - Nie używaj emoji spoza serwera!',
        required: true,
        max_length: 40,
    })
    title: string;

    @StringOption({
        name: 'opis',
        description: 'Opis twojego wydarzenia - Nie używaj emoji spoza serwera!',
        required: true,
        max_length: 200,
    })
    description: string;

    @StringOption({
        name: 'data-rozpoczęcia',
        description: 'Własnymi słowami - kiedy rozpoczyna się wydarzenie?',
        required: false,
    })
    startDate: string;

    @StringOption({
        name: 'data-zakończenia',
        description: 'Własnymi słowami - kiedy kończy się wydarzenie?',
        required: false,
    })
    endDate: string;

    @StringOption({
        name: 'kolor',
        description: 'Kolor twojego wydarzenia',
        required: false,
        choices: [
            {
                name: 'Czerwony',
                value: '#ff0000'
            },
            {
                name: 'Niebieski',
                value: '#0000ff'
            },
            {
                name: 'Zielony',
                value: '#00ff00'
            },
            {
                name: 'Żółty',
                value: '#ffff00'
            },
            {
                name: 'Fioletowy',
                value: '#ff00ff'
            },
            {
                name: 'Różowy',
                value: '#ff00ff'
            },
            {
                name: 'Biały',
                value: '#ffffff'
            },
            {
                name: 'Pomarańczowy',
                value: '#ffa500'
            }
        ]
    })
    color: `#${string}`;

    @AttachmentOption({
        name: 'grafika',
        description: 'Grafika twojego wydarzenia',
        required: false,
    })
    image: Attachment;
    
}

export { handleCommunityEventCreateDiscordCommandDto };