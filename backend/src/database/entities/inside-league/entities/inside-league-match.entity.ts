import { BaseEntity, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { InsideTeamEntity } from "../../inside-teams/entities/inside-team.entity";

@Entity({
    name: 'inside_league_match'
})
export class InsideLeagueMatchEntity extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => InsideLeagueMatchEntity, match => match.season)
    season: InsideLeagueMatchEntity;

    @ManyToOne(() => InsideTeamEntity, team => team.insideLeagueMatches)
    opponents: InsideTeamEntity[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
