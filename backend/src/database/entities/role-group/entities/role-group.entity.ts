import { BaseEntity, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { RoleEntity } from "../../role/entities/role.entity";

@Entity({
    name: 'role_group',
})
export class RoleGroupEntity extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    // name
    @Column({ unique: true })
    name: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @OneToMany(() => RoleEntity, role => role.roleGroup)
    roles: RoleEntity[];
}
