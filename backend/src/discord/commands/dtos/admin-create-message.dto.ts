import { ChannelOption, StringOption } from "necord";

class handleAdminCreateMessageDto {
    @StringOption({
        name: 'typ-wiadomości',
        description: 'Jaką wiadomość stworzyć',
        required: true,
        autocomplete: false,
        choices: [
            {
                name: 'Synchronizacja kont Apex Legends',
                value: 'synchronization'

            },
        ]
    })
    messageType: 'synchronization';

    @ChannelOption({
        name: 'kanał',
        description: 'Na jakim kanale stworzyć wiadomość',
        required: false,
    })
    channel: string;
}

export { handleAdminCreateMessageDto };