export interface ApexSeason {
  info?: Info
  new?: New
  dates?: Dates
  misc?: Misc,
  error?: string,
}

export interface Info {
  ID: number
  Name: string
  Tagline: string
}

export interface New {
  Legend: string
  Weapon: string
  Map: string
}

export interface Dates {
  Start: number
  End: number
}

export interface Misc {
  Color: string
  Link: string
}