import { UserEntity } from "../../user/user.entity";

export class CreateApexAccountDto {
    user: UserEntity;
    name: string;
    uid: string;
    avatarUrl: string;
    platform: string;
    rankScore: number;
    rankName: string;
    rankDivision: string;
    rankImg: string;
    level: number;
    percentToNextLevel: number;
    brTotalKills: number;
    brTotalWins: number;
    brTotalGamesPlayed: number;
    brKDR: number;
    brTotalDamage: number;
    lastLegendPlayed: string;
}
