import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { InsideLeagueMatchEntity } from "./inside-league-match.entity";
import { InsideTeamEntity } from "../../inside-teams/entities/inside-team.entity";

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

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
