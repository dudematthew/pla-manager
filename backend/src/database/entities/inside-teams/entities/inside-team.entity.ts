import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { RoleEntity } from "../../role/entities/role.entity";

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

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @OneToOne(() => RoleEntity)
    @JoinColumn()
    role: RoleEntity;

}
