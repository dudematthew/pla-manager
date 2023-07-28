export interface PlayerStatisticsParamsDto {
    player?: string;
    uid?: string;
    platform?: 'PC' | 'PS4' | 'X1' | 'SWITCH';
    enableClubsBeta?: 1 | 0;
    skipRank?: 1 | 0;
    merge?: 1 | 0;
    removeMerged?: 1 | 0;
}