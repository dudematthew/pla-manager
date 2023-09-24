import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { RoleEntity } from "../../role/entities/role.entity";
import { InsideLeagueSeasonEntity } from "../../inside-league/entities/inside-league-season.entity";
import { InsideLeagueMatchEntity } from "../../inside-league/entities/inside-league-match.entity";

@Entity({
    name: 'team'
})
export class InsideTeamEntity extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({
        name: 'display_name'
    })
    displayName: string;

    @Column({
        name: 'logo_url'
    })
    logoUrl: string;

    @Column()
    color: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @OneToOne(() => RoleEntity)
    @JoinColumn()
    role: RoleEntity;
}
