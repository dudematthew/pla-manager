import { User } from "discord.js";
import { DiscordService } from "src/discord/discord.service";
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
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

    // constructor(
    //     partial: Partial<UserEntity>,
    //     private readonly discordService: DiscordService,
    // ) {
    //     super();
    //     Object.assign(this, partial);
    // }

    // get hasAvailableDiscordAccount(): boolean {
    //     return this.discordUser !== null;
    // }

    // get discordUser(): Promise<User> {
    //     return this.discordService.getUserById(this.discordId);
    // }

    // get username(): Promise<string> {
    //     return this.discordUser.then(user => user.username);
    // }

    // get discriminator(): Promise<string> {
    //     return this.discordUser.then(user => user.discriminator);
    // }

    // get displayAvatarURL(): Promise<string> {
    //     return this.discordUser.then(user => user.displayAvatarURL());
    // }
}