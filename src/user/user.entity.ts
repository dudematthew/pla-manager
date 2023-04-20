import { User } from "discord.js";
import { DiscordService } from "src/discord/discord.service";
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class UserEntity extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    discord_id: string;

    @Column()
    email: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @Column()
    is_admin: boolean;

    constructor(
        partial: Partial<UserEntity>,
        private readonly discordService: DiscordService,
    ) {
        super();
        Object.assign(this, partial);
    }

    get hasAvailableDiscordAccount(): boolean {
        return this.discordUser !== null;
    }

    get discordUser(): Promise<User> {
        return this.discordService.getUserById(this.discord_id);
    }

    get username(): Promise<string> {
        return this.discordUser.then(user => user.username);
    }

    get discriminator(): Promise<string> {
        return this.discordUser.then(user => user.discriminator);
    }

    get displayAvatarURL(): Promise<string> {
        return this.discordUser.then(user => user.displayAvatarURL());
    }
}