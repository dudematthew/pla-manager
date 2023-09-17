import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { InsideTeamEntity } from "../../inside-teams/entities/inside-team.entity";
import { InsideLeagueMatchEntity } from "./inside-league-match.entity";

@Entity({
    name: 'inside_league_match_score'
})
export class InsideLeagueMatchScoreEntity extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => InsideTeamEntity)
    team: InsideTeamEntity;

    @ManyToOne(() => InsideLeagueMatchEntity)
    match: InsideLeagueMatchEntity;

    @Column()
    score: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

}