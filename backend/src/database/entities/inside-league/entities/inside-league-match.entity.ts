import { BaseEntity, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { InsideTeamEntity } from "../../inside-teams/entities/inside-team.entity";
import { InsideLeagueSeasonEntity } from "./inside-league-season.entity";

@Entity({
    name: 'inside_league_match'
})
export class InsideLeagueMatchEntity extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => InsideLeagueSeasonEntity, season => season.matches)
    season: InsideLeagueMatchEntity;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
