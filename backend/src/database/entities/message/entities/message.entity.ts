import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, ManyToMany, JoinTable } from "typeorm";
import { ChannelEntity } from "../../channel/channel.entity";
import { UserEntity } from "../../user/user.entity";

@Entity({
    name: 'message',
})
export class MessageEntity extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, name: 'discord_id' })
    discordId: string;

    @Column({
        nullable: true,
        default: 'default',
    })
    name: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @ManyToOne(() => ChannelEntity, channel => channel.messages, {
        nullable: false,
    })
    channel: ChannelEntity;

    @ManyToOne(() => UserEntity, user => user.messages)
    user: UserEntity;
}