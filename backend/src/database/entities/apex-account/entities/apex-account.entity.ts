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
    @Column({ name: 'avatar_url', nullable: true })
    avatarUrl: string;

    // platform
    @Column()
    platform: string;

    // rank score
    @Column({ name: 'rank_score', nullable: true })
    rankScore: number;

    // rank name
    @Column({ name: 'rank_name', nullable: true })
    rankName: string;

    // rank division
    @Column({ name: 'rank_division', nullable: true })
    rankDivision: string;

    // rank img
    @Column({ name: 'rank_img', nullable: true })
    rankImg: string;

    // level
    @Column({ nullable: true })
    level: number;

    // percent to next level
    @Column({ name: 'percent_to_next_level', nullable: true })
    percentToNextLevel: number;

    // battle royal total kills
    @Column({ name: 'br_total_kills', nullable: true })
    brTotalKills: number;

    // battle royal total wins
    @Column({ name: 'br_total_wins', nullable: true })
    brTotalWins: number;

    // battle royal total games played
    @Column({ name: 'br_total_games_played', nullable: true })
    brTotalGamesPlayed: number;

    // kill death ratio
    @Column({ name: 'br_kdr', nullable: true })
    brKDR: number;

    // battle royal total damage
    @Column({ name: 'br_total_damage', nullable: true })
    brTotalDamage: number;

    // last legend played
    @Column({ name: 'last_legend_played', nullable: true })
    lastLegendPlayed: string;

    @CreateDateColumn({ name: 'created_at', nullable: true })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', nullable: true })
    updatedAt: Date;

}
