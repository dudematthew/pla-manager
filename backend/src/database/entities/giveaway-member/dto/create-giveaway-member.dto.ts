import { UserEntity } from "../../user/user.entity";

export class CreateGiveawayMemberDto {
    twitchId: string;
    twitchNick: string;
    user: UserEntity;
}
