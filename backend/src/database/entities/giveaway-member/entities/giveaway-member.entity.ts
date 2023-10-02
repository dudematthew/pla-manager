import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "../../user/user.entity";

@Entity({
    name: 'giveaway_member'
})
export class GiveawayMemberEntity extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        name: 'twitch_id',
        type: 'varchar',
        length: 255,
        nullable: false,
        unique: true,
    })
    twitchId: string;

    @Column({
        name: 'twitch_nick',
        type: 'varchar',
        length: 255,
        nullable: false,
    })
    twitchNick: string;

    @OneToOne(() => UserEntity, user => user.giveawayMember)
    user: UserEntity;
}
