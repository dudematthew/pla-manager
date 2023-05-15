export interface PlayerStatisticsParamsDto {
    player: string;
    uid: string;
    platform: 'PC' | 'PS4' | 'X1' | 'SWITCH';
    enableClubsBeta: boolean;
    skipRank: boolean;
    merge: boolean;
    removeMerged: boolean;
}