import { BaseEntity, Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ApexAccountEntity } from "../apex-account/entities/apex-account.entity";

@Entity({
    name: 'user',
})
export class UserEntity extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, name: 'discord_id' })
    discordId: string;

    @Column()
    email: string;

    @Column({ default: false, name: 'is_admin'})
    isAdmin: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @OneToOne(() => ApexAccountEntity, apexAccount => apexAccount.id)
    apexAccount: ApexAccountEntity;
}