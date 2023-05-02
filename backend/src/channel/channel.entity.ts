import { BaseEntity, Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { DiscordService } from "src/discord/discord.service";
import { Channel } from "discord.js";

@Entity()
export class ChannelEntity extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, name: 'discord_id' })
    discordId: string;

    @Column()
    name: string;

    @Column()
    type: 'text' | 'voice';

    constructor(
        partial: Partial<ChannelEntity>,
        private readonly discordService: DiscordService,
    ) {
        super();
        Object.assign(this, partial);
    }

    /**
     * Returns the Discord channel
     */
    get discordChannel(): Promise<Channel> {
        return this.discordService.getChannelById(this.discordId);
    }

    /**
     * Returns true if the channel exists on Discord
     */
    get isValid(): boolean {
        return this.discordChannel !== null;
    }

    


}