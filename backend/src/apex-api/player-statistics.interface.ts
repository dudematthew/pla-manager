export interface PlayerStatistics {
    global?: Global
    realtime?: Realtime
    legends?: Legends
    mozambiquehere_internal?: MozambiquehereInternal
    ALS?: Als
    total?: Total,
    error?: string,
  }
  
  export interface Global {
    name: string
    uid: number
    avatar: string
    platform: string
    level: number
    toNextLevelPercent: number
    internalUpdateCount: number
    bans: Bans
    rank: Rank
    arena: Arena
    battlepass: Battlepass
    internalParsingVersion: number
    badges: Badge[]
    levelPrestige: number,
  }
  
  export interface Bans {
    isActive: boolean
    remainingSeconds: number
    last_banReason: string
  }
  
  export interface Rank {
    rankScore: number
    rankName: string
    rankDiv: number
    ladderPosPlatform: number
    rankImg: string
    rankedSeason: string
  }
  
  export interface Arena {
    rankScore: number
    rankName: string
    rankDiv: number
    ladderPosPlatform: number
    rankImg: string
    rankedSeason: string
  }
  
  export interface Battlepass {
    level: string
    history: History
  }
  
  export interface History {
    season1: number
    season2: number
    season3: number
    season4: number
    season5: number
    season6: number
    season7: number
    season8: number
    season9: number
    season10: number
    season11: number
    season12: number
    season13: number
    season14: number
  }
  
  export interface Badge {
    name: string
    value: number
  }
  
  export interface Realtime {
    lobbyState: string
    isOnline: number
    isInGame: number
    canJoin: number
    partyFull: number
    selectedLegend: string
    currentState: string
    currentStateSinceTimestamp: number
    currentStateAsText: string
  }
  
  export interface Legends {
    selected: Selected
    all: All
  }
  
  export interface Selected {
    LegendName: string
    data: any[]
    gameInfo: GameInfo
    ImgAssets: ImgAssets
  }
  
  export interface GameInfo {
    skin: string
    skinRarity: string
    frame: string
    frameRarity: string
    pose: string
    poseRarity: string
    intro: string
    introRarity: string
    badges: Badge2[]
  }
  
  export interface Badge2 {
    name?: string
    value: number
    category: string
  }
  
  export interface ImgAssets {
    icon: string
    banner: string
  }
  
  export interface All {
    Global: Global2
    Revenant: Revenant
    Crypto: Crypto
    Horizon: Horizon
    Gibraltar: Gibraltar
    Wattson: Wattson
    Fuse: Fuse
    Bangalore: Bangalore
    Wraith: Wraith
    Octane: Octane
    Bloodhound: Bloodhound
    Caustic: Caustic
    Lifeline: Lifeline
    Pathfinder: Pathfinder
    Loba: Loba
    Mirage: Mirage
    Rampart: Rampart
    Valkyrie: Valkyrie
    Seer: Seer
    Ash: Ash
    "Mad Maggie": MadMaggie
    Newcastle: Newcastle
    Vantage: Vantage
    Catalyst: Catalyst
    Ballistic: Ballistic
  }
  
  export interface Global2 {
    data: Daum[]
    ImgAssets: ImgAssets2
  }
  
  export interface Daum {
    name: string
    value: number
    key: string
    rank: Rank2
    rankPlatformSpecific: RankPlatformSpecific
  }
  
  export interface Rank2 {
    rankPos: number
    topPercent: number
  }
  
  export interface RankPlatformSpecific {
    rankPos: number
    topPercent: number
  }
  
  export interface ImgAssets2 {
    icon: string
    banner: string
  }
  
  export interface Revenant {
    data: Daum2[]
    ImgAssets: ImgAssets3
  }
  
  export interface Daum2 {
    name: string
    value: number
    key: string
    rank: Rank3
    rankPlatformSpecific: RankPlatformSpecific2
  }
  
  export interface Rank3 {
    rankPos: any
    topPercent: any
  }
  
  export interface RankPlatformSpecific2 {
    rankPos: string
    topPercent: string
  }
  
  export interface ImgAssets3 {
    icon: string
    banner: string
  }
  
  export interface Crypto {
    data: Daum3[]
    gameInfo: GameInfo2
    ImgAssets: ImgAssets4
  }
  
  export interface Daum3 {
    name: string
    value: number
    key: string
    rank: Rank4
    rankPlatformSpecific: RankPlatformSpecific3
  }
  
  export interface Rank4 {
    rankPos: number
    topPercent: number
  }
  
  export interface RankPlatformSpecific3 {
    rankPos: number
    topPercent: number
  }
  
  export interface GameInfo2 {
    badges: Badge3[]
  }
  
  export interface Badge3 {
    name: string
    value: number
  }
  
  export interface ImgAssets4 {
    icon: string
    banner: string
  }
  
  export interface Horizon {
    ImgAssets: ImgAssets5
  }
  
  export interface ImgAssets5 {
    icon: string
    banner: string
  }
  
  export interface Gibraltar {
    data: Daum4[]
    ImgAssets: ImgAssets6
  }
  
  export interface Daum4 {
    name: string
    value: number
    key: string
    rank: Rank5
    rankPlatformSpecific: RankPlatformSpecific4
  }
  
  export interface Rank5 {
    rankPos: any
    topPercent: any
  }
  
  export interface RankPlatformSpecific4 {
    rankPos: string
    topPercent: string
  }
  
  export interface ImgAssets6 {
    icon: string
    banner: string
  }
  
  export interface Wattson {
    data: Daum5[]
    ImgAssets: ImgAssets7
  }
  
  export interface Daum5 {
    name: string
    value: number
    key: string
    rank: Rank6
    rankPlatformSpecific: RankPlatformSpecific5
  }
  
  export interface Rank6 {
    rankPos: number
    topPercent: number
  }
  
  export interface RankPlatformSpecific5 {
    rankPos: number
    topPercent: number
  }
  
  export interface ImgAssets7 {
    icon: string
    banner: string
  }
  
  export interface Fuse {
    data: Daum6[]
    ImgAssets: ImgAssets8
  }
  
  export interface Daum6 {
    name: string
    value: number
    key: string
    rank: Rank7
    rankPlatformSpecific: RankPlatformSpecific6
  }
  
  export interface Rank7 {
    rankPos: number
    topPercent: number
  }
  
  export interface RankPlatformSpecific6 {
    rankPos: number
    topPercent: number
  }
  
  export interface ImgAssets8 {
    icon: string
    banner: string
  }
  
  export interface Bangalore {
    data: Daum7[]
    gameInfo: GameInfo3
    ImgAssets: ImgAssets9
  }
  
  export interface Daum7 {
    name: string
    value: number
    key: string
    rank: Rank8
    rankPlatformSpecific: RankPlatformSpecific7
  }
  
  export interface Rank8 {
    rankPos: number
    topPercent: number
  }
  
  export interface RankPlatformSpecific7 {
    rankPos: number
    topPercent: number
  }
  
  export interface GameInfo3 {
    badges: Badge4[]
  }
  
  export interface Badge4 {
    name: string
    value: number
  }
  
  export interface ImgAssets9 {
    icon: string
    banner: string
  }
  
  export interface Wraith {
    data: Daum8[]
    gameInfo: GameInfo4
    ImgAssets: ImgAssets10
  }
  
  export interface Daum8 {
    name: string
    value: number
    key: string
    rank: Rank9
    rankPlatformSpecific: RankPlatformSpecific8
  }
  
  export interface Rank9 {
    rankPos: any
    topPercent: any
  }
  
  export interface RankPlatformSpecific8 {
    rankPos: any
    topPercent: any
  }
  
  export interface GameInfo4 {
    badges: Badge5[]
  }
  
  export interface Badge5 {
    name: string
    value: number
  }
  
  export interface ImgAssets10 {
    icon: string
    banner: string
  }
  
  export interface Octane {
    data: Daum9[]
    gameInfo: GameInfo5
    ImgAssets: ImgAssets11
  }
  
  export interface Daum9 {
    name: string
    value: number
    key: string
    rank: Rank10
    rankPlatformSpecific: RankPlatformSpecific9
  }
  
  export interface Rank10 {
    rankPos: number
    topPercent: number
  }
  
  export interface RankPlatformSpecific9 {
    rankPos: any
    topPercent: any
  }
  
  export interface GameInfo5 {
    badges: Badge6[]
  }
  
  export interface Badge6 {
    name: string
    value: number
  }
  
  export interface ImgAssets11 {
    icon: string
    banner: string
  }
  
  export interface Bloodhound {
    data: Daum10[]
    gameInfo: GameInfo6
    ImgAssets: ImgAssets12
  }
  
  export interface Daum10 {
    name: string
    value: number
    key: string
    rank: Rank11
    rankPlatformSpecific: RankPlatformSpecific10
  }
  
  export interface Rank11 {
    rankPos: number
    topPercent: number
  }
  
  export interface RankPlatformSpecific10 {
    rankPos: number
    topPercent: number
  }
  
  export interface GameInfo6 {
    badges: Badge7[]
  }
  
  export interface Badge7 {
    name: string
    value: number
  }
  
  export interface ImgAssets12 {
    icon: string
    banner: string
  }
  
  export interface Caustic {
    data: Daum11[]
    ImgAssets: ImgAssets13
  }
  
  export interface Daum11 {
    name: string
    value: number
    key: string
    rank: Rank12
    rankPlatformSpecific: RankPlatformSpecific11
  }
  
  export interface Rank12 {
    rankPos: number
    topPercent: number
  }
  
  export interface RankPlatformSpecific11 {
    rankPos: string
    topPercent: string
  }
  
  export interface ImgAssets13 {
    icon: string
    banner: string
  }
  
  export interface Lifeline {
    data: Daum12[]
    gameInfo: GameInfo7
    ImgAssets: ImgAssets14
  }
  
  export interface Daum12 {
    name: string
    value: number
    key: string
    rank: Rank13
    rankPlatformSpecific: RankPlatformSpecific12
  }
  
  export interface Rank13 {
    rankPos: number
    topPercent: number
  }
  
  export interface RankPlatformSpecific12 {
    rankPos: number
    topPercent: number
  }
  
  export interface GameInfo7 {
    badges: Badge8[]
  }
  
  export interface Badge8 {
    name: string
    value: number
  }
  
  export interface ImgAssets14 {
    icon: string
    banner: string
  }
  
  export interface Pathfinder {
    data: Daum13[]
    ImgAssets: ImgAssets15
  }
  
  export interface Daum13 {
    name: string
    value: number
    key: string
    rank: Rank14
    rankPlatformSpecific: RankPlatformSpecific13
  }
  
  export interface Rank14 {
    rankPos: number
    topPercent: number
  }
  
  export interface RankPlatformSpecific13 {
    rankPos: number
    topPercent: number
  }
  
  export interface ImgAssets15 {
    icon: string
    banner: string
  }
  
  export interface Loba {
    data: Daum14[]
    ImgAssets: ImgAssets16
  }
  
  export interface Daum14 {
    name: string
    value: number
    key: string
    rank: Rank15
    rankPlatformSpecific: RankPlatformSpecific14
  }
  
  export interface Rank15 {
    rankPos: number
    topPercent: number
  }
  
  export interface RankPlatformSpecific14 {
    rankPos: number
    topPercent: number
  }
  
  export interface ImgAssets16 {
    icon: string
    banner: string
  }
  
  export interface Mirage {
    data: Daum15[]
    ImgAssets: ImgAssets17
  }
  
  export interface Daum15 {
    name: string
    value: number
    key: string
    rank: Rank16
    rankPlatformSpecific: RankPlatformSpecific15
  }
  
  export interface Rank16 {
    rankPos: any
    topPercent: any
  }
  
  export interface RankPlatformSpecific15 {
    rankPos: string
    topPercent: string
  }
  
  export interface ImgAssets17 {
    icon: string
    banner: string
  }
  
  export interface Rampart {
    data: Daum16[]
    ImgAssets: ImgAssets18
  }
  
  export interface Daum16 {
    name: string
    value: number
    key: string
    rank: Rank17
    rankPlatformSpecific: RankPlatformSpecific16
  }
  
  export interface Rank17 {
    rankPos: number
    topPercent: number
  }
  
  export interface RankPlatformSpecific16 {
    rankPos: any
    topPercent: any
  }
  
  export interface ImgAssets18 {
    icon: string
    banner: string
  }
  
  export interface Valkyrie {
    data: Daum17[]
    gameInfo: GameInfo8
    ImgAssets: ImgAssets19
  }
  
  export interface Daum17 {
    name: string
    value: number
    key: string
    rank: Rank18
    rankPlatformSpecific: RankPlatformSpecific17
  }
  
  export interface Rank18 {
    rankPos: number
    topPercent: number
  }
  
  export interface RankPlatformSpecific17 {
    rankPos: string
    topPercent: string
  }
  
  export interface GameInfo8 {
    badges: Badge9[]
  }
  
  export interface Badge9 {
    name: string
    value: number
  }
  
  export interface ImgAssets19 {
    icon: string
    banner: string
  }
  
  export interface Seer {
    data: Daum18[]
    ImgAssets: ImgAssets20
  }
  
  export interface Daum18 {
    name: string
    value: number
    key: string
    rank: Rank19
    rankPlatformSpecific: RankPlatformSpecific18
  }
  
  export interface Rank19 {
    rankPos: number
    topPercent: number
  }
  
  export interface RankPlatformSpecific18 {
    rankPos: number
    topPercent: number
  }
  
  export interface ImgAssets20 {
    icon: string
    banner: string
  }
  
  export interface Ash {
    data: Daum19[]
    gameInfo: GameInfo9
    ImgAssets: ImgAssets21
  }
  
  export interface Daum19 {
    name: string
    value: number
    key: string
    rank: Rank20
    rankPlatformSpecific: RankPlatformSpecific19
  }
  
  export interface Rank20 {
    rankPos: number
    topPercent: number
  }
  
  export interface RankPlatformSpecific19 {
    rankPos: number
    topPercent: number
  }
  
  export interface GameInfo9 {
    badges: Badge10[]
  }
  
  export interface Badge10 {
    name: string
    value: number
  }
  
  export interface ImgAssets21 {
    icon: string
    banner: string
  }
  
  export interface MadMaggie {
    ImgAssets: ImgAssets22
  }
  
  export interface ImgAssets22 {
    icon: string
    banner: string
  }
  
  export interface Newcastle {
    data: Daum20[]
    ImgAssets: ImgAssets23
  }
  
  export interface Daum20 {
    name: string
    value: number
    key: string
    rank: Rank21
    rankPlatformSpecific: RankPlatformSpecific20
  }
  
  export interface Rank21 {
    rankPos: number
    topPercent: number
  }
  
  export interface RankPlatformSpecific20 {
    rankPos: number
    topPercent: number
  }
  
  export interface ImgAssets23 {
    icon: string
    banner: string
  }
  
  export interface Vantage {
    ImgAssets: ImgAssets24
  }
  
  export interface ImgAssets24 {
    icon: string
    banner: string
  }
  
  export interface Catalyst {
    ImgAssets: ImgAssets25
  }
  
  export interface ImgAssets25 {
    icon: string
    banner: string
  }
  
  export interface Ballistic {
    ImgAssets: ImgAssets26
  }
  
  export interface ImgAssets26 {
    icon: string
    banner: string
  }
  
  export interface MozambiquehereInternal {
    isNewToDB: boolean
    claimedBy: string
    APIAccessType: string
    ClusterID: string
    rate_limit: RateLimit
    clusterSrv: string
  }
  
  export interface RateLimit {
    max_per_second: any
    current_req: string
  }
  
  export interface Als {
    isALSDataEnabled: boolean
  }
  
  export interface Total {
    jackson_bow_out_damage_done: JacksonBowOutDamageDone
    kills_season_5: KillsSeason5
    specialEvent_kills: SpecialEventKills
    specialEvent_wins: SpecialEventWins
    kills: Kills
    damage: Damage
    wins_season_1: WinsSeason1
    wins_season_2: WinsSeason2
    wins_season_5: WinsSeason5
    wins_season_8: WinsSeason8
    wins_season_4: WinsSeason4
    specialEvent_damage: SpecialEventDamage
    kills_season_6: KillsSeason6
    kills_season_7: KillsSeason7
    kills_season_9: KillsSeason9
    arenas_kills: ArenasKills
    kills_season_10: KillsSeason10
    top_3: Top3
    enemies_scanned: EnemiesScanned
    grandsoiree_kills: GrandsoireeKills
    grandsoiree_wins: GrandsoireeWins
    grandsoiree_damage: GrandsoireeDamage
    winning_kills: WinningKills
    kills_season_15: KillsSeason15
    kills_as_kill_leader: KillsAsKillLeader
    tactical_enemy_tethered: TacticalEnemyTethered
    kills_season_11: KillsSeason11
    wins_season_11: WinsSeason11
    kills_season_13: KillsSeason13
    kd: Kd
  }
  
  export interface JacksonBowOutDamageDone {
    name: string
    value: number
  }
  
  export interface KillsSeason5 {
    name: string
    value: number
  }
  
  export interface SpecialEventKills {
    name: string
    value: number
  }
  
  export interface SpecialEventWins {
    name: string
    value: number
  }
  
  export interface Kills {
    name: string
    value: number
  }
  
  export interface Damage {
    name: string
    value: number
  }
  
  export interface WinsSeason1 {
    name: string
    value: number
  }
  
  export interface WinsSeason2 {
    name: string
    value: number
  }
  
  export interface WinsSeason5 {
    name: string
    value: number
  }
  
  export interface WinsSeason8 {
    name: string
    value: number
  }
  
  export interface WinsSeason4 {
    name: string
    value: number
  }
  
  export interface SpecialEventDamage {
    name: string
    value: number
  }
  
  export interface KillsSeason6 {
    name: string
    value: number
  }
  
  export interface KillsSeason7 {
    name: string
    value: number
  }
  
  export interface KillsSeason9 {
    name: string
    value: number
  }
  
  export interface ArenasKills {
    name: string
    value: number
  }
  
  export interface KillsSeason10 {
    name: string
    value: number
  }
  
  export interface Top3 {
    name: string
    value: number
  }
  
  export interface EnemiesScanned {
    name: string
    value: number
  }
  
  export interface GrandsoireeKills {
    name: string
    value: number
  }
  
  export interface GrandsoireeWins {
    name: string
    value: number
  }
  
  export interface GrandsoireeDamage {
    name: string
    value: number
  }
  
  export interface WinningKills {
    name: string
    value: number
  }
  
  export interface KillsSeason15 {
    name: string
    value: number
  }
  
  export interface KillsAsKillLeader {
    name: string
    value: number
  }
  
  export interface TacticalEnemyTethered {
    name: string
    value: number
  }
  
  export interface KillsSeason11 {
    name: string
    value: number
  }
  
  export interface WinsSeason11 {
    name: string
    value: number
  }
  
  export interface KillsSeason13 {
    name: string
    value: number
  }
  
  export interface Kd {
    value: string
    name: string
  }
  