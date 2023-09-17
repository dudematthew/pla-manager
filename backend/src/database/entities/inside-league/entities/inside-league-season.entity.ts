import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { InsideTeamEntity } from "../../inside-teams/entities/inside-team.entity";
import { InsideLeagueMatchEntity } from "./inside-league-match.entity";

@Entity({
    name: 'inside_league_season'
})
export class InsideLeagueSeasonEntity extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({
        name: 'background_image',
    })
    backgroundImage: string;

    @OneToMany(() => InsideLeagueMatchEntity, match => match.season)
    matches: InsideLeagueMatchEntity[];

    @ManyToOne(() => InsideTeamEntity, team => team.insideLeagueWins)
    winner: InsideTeamEntity;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
