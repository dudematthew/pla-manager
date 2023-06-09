import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ApexAccountEntity } from "../apex-account/entities/apex-account.entity";
import { MessageEntity } from "../message/entities/message.entity";

@Entity({
    name: 'user',
})
export class UserEntity extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, name: 'discord_id' })
    discordId: string;

    @Column({ nullable: true })
    email: string;

    @Column({ default: false, name: 'is_admin'})
    isAdmin: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @OneToMany(() => MessageEntity, message => message.user)
    messages: MessageEntity[];

    @OneToOne(() => ApexAccountEntity, apexAccount => apexAccount.user)
    @JoinColumn()
    apexAccount: ApexAccountEntity;
}