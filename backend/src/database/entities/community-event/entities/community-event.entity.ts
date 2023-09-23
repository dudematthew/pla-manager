import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserEntity } from "../../user/user.entity";

@Entity({
    name: "community_events",
})
export class CommunityEventEntity extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column({ name: "start_date" })
    startDate: Date;

    @Column({ name: "end_date" })
    endDate: Date;

    @Column({ name: "image_url" })
    imageUrl: string;

    @Column({
        name: "approve_state",
        type: "enum",
        enum: ["pending", "approved", "rejected"],
        default: "pending",
        nullable: false,
    })
    approveState: "pending" | "approved" | "rejected";

    @Column()
    color: string;

    @ManyToOne(() => UserEntity, user => user.communityEvents)
    user: UserEntity;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
