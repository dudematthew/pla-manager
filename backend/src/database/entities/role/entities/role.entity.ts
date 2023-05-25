import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BaseEntity, OneToOne, ManyToOne } from "typeorm";
import { EmojiEntity } from "../../emoji/entities/emoji.entity";

@Entity({
    name: 'role',
})
export class RoleEntity extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, name: 'discord_id' })
    discordId: string;

    @Column()
    name: string;

    @Column({ name: 'priority', default: 0 })
    priority: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
    
    @ManyToOne(() => EmojiEntity, emoji => emoji.roles)
    emoji: EmojiEntity;
}
