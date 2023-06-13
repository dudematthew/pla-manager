import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { DiscordService } from "src/discord/discord.service";
import { Channel } from "discord.js";
import { MessageEntity } from "../message/entities/message.entity";

export enum ChannelTypeFormat {
    TEXT = 'text',
    VOICE = 'voice',
};

@Entity({
    name: 'channel',
})
export class ChannelEntity extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, name: 'discord_id' })
    discordId: string;

    @Column()
    name: string;

    @Column({
        type: 'enum',
        enum: ChannelTypeFormat,
        default: ChannelTypeFormat.TEXT,
    })
    type: ChannelTypeFormat;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @OneToMany(() => MessageEntity, message => message.channel)
    messages: MessageEntity[];
}