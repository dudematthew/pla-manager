import { BaseEntity, OneToOne } from "typeorm";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserEntity } from "../../user/user.entity";

@Entity({
    name: 'apex_account',
})
export class ApexAccountEntity extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => UserEntity, user => user.apexAccount)
    user: UserEntity;

    // name
    @Column({ unique: true })
    name: string;

    // uid
    @Column({ unique: true })
    uid: string;

    // avatar url
    @Column({ name: 'avatar_url' })
    avatarUrl: string;

    // platform
    @Column()
    platform: string;

    // rank score
    @Column({ name: 'rank_score' })
    rankScore: number;

    // rank name
    @Column({ name: 'rank_name' })
    rankName: string;

    // rank division
    @Column({ name: 'rank_division' })
    rankDivision: string;

    // rank img
    @Column({ name: 'rank_img' })
    rankImg: string;

    // level
    @Column()
    level: number;

    // percent to next level
    @Column({ name: 'percent_to_next_level' })
    percentToNextLevel: number;

    // battle royal total kills
    @Column({ name: 'br_total_kills' })
    brTotalKills: number;

    // battle royal total wins
    @Column({ name: 'br_total_wins' })
    brTotalWins: number;

    // battle royal total games played
    @Column({ name: 'br_total_games_played' })
    brTotalGamesPlayed: number;

    // kill death ratio
    @Column({ name: 'br_kdr' })
    brKDR: number;

    // battle royal total damage
    @Column({ name: 'br_total_damage' })
    brTotalDamage: number;

    // last legend played
    @Column({ name: 'last_legend_played' })
    lastLegendPlayed: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

}
