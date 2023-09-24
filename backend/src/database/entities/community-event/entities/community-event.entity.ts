import { BaseEntity, Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserEntity } from "../../user/user.entity";

@Entity({
    name: "community_events",
})
export class CommunityEventEntity extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        charset: "utf8mb4",
        collation: "utf8mb4_unicode_ci",
    })
    name: string;

    @Column({
        charset: "utf8mb4",
        collation: "utf8mb4_unicode_ci",
    })
    description: string;

    @Column({
        name: "start_date",
        nullable: true,
    })
    startDate: Date;

    @Column({
        name: "end_date",
        nullable: true,
    })
    endDate: Date;

    @Column({
        name: "image_url",
        nullable: true,
    })
    imageUrl: string;

    @Column({
        name: "approve_state",
        type: "enum",
        enum: ["pending", "approved", "rejected"],
        default: "pending",
        nullable: false,
    })
    approveState: "pending" | "approved" | "rejected";

    @Column({
        default: false,
    })
    reminder: boolean;

    @Column({
        nullable: true,
    })
    color: string;

    @ManyToOne(() => UserEntity, user => user.communityEvents)
    user: UserEntity;

    @ManyToMany(() => UserEntity, user => user.communityEventReminders)
    @JoinTable()
    reminders: UserEntity[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
