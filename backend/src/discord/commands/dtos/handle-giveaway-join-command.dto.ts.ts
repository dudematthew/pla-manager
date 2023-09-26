import { Attachment, GuildMember, User } from "discord.js";
import { AttachmentOption, MemberOption, StringOption, UserOption } from "necord";

class handleGivewayJoinCommandDto {

    @StringOption({
        name: 'nick-twitch',
        description: 'Nick na twitchu, który zafollowował kanał snakebitebettyx',
    })
    twitchNick: string;
}

export { handleGivewayJoinCommandDto };