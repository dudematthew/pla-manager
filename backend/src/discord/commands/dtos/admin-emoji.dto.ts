import { StringOption } from "necord";

export class AdminEmojiDto {
    @StringOption({
        name: 'nazwa-emoji',
        description: 'Nazwa emoji w bazie danych',
        required: true,
    })
    emojiName: string;

    @StringOption({
        name: 'emoji',
        description: 'Emoji do ustawienia',
        required: true,
    })
    emoji: string;
}