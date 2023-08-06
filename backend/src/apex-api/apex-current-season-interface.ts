    export interface ApexCurrentSeason {
        info?: Info
        dates?: Dates,
        error?: string,
    }

    export interface Info {
        ID: number
        Name: string
        Split: number
    }

    export interface Dates {
        Start: number
        Split: number
        End: number
    }