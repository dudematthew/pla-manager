import { BaseEntity, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { RoleEntity } from "../../role/entities/role.entity";

@Entity({
    name: "emoji",
})
export class EmojiEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({
        name: "discord_id",
    })
    discordId: string;

    @Column({
        name: "discord_name",
    })
    discordName: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @OneToMany(() => RoleEntity, role => role.emoji)
    roles: RoleEntity[];

    toString() {
        return `<:${this.name}:${this.discordId}>`;
    }
}
