import { Attachment, GuildMember, User } from "discord.js";
import { AttachmentOption, MemberOption, StringOption, UserOption } from "necord";

class handleGivewayJoinCommandDto {

    @StringOption({
        name: 'nick-twitch',
        description: 'Nick na twitchu, który zafollowował kanał snakebitebettyx',
        required: true,
        max_length: 26,
    })
    twitchNick: string;
}

export { handleGivewayJoinCommandDto };