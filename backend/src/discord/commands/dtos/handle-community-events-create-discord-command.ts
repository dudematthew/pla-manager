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
        description: 'Kiedy rozpoczyna się wydarzenie? (DD.MM GG:MM) / (GG:MM)',
        required: false,
    })
    startDate: string;

    @StringOption({
        name: 'data-zakończenia',
        description: 'Kiedy kończy się wydarzenie? (DD.MM GG:MM) / (GG:MM)',
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