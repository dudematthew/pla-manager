import { Attachment, GuildMember, User } from "discord.js";
import { AttachmentOption, BooleanOption, MemberOption, StringOption, UserOption } from "necord";

class handleCommunityEventStatusDiscordCommandDto {

    @BooleanOption({
        name: 'raport',
        description: 'Czy pokazać status w formie łatwej do skopiowania? Głównie dla organizatorów',
        required: false,
    })
    log: boolean;
}

export { handleCommunityEventStatusDiscordCommandDto };