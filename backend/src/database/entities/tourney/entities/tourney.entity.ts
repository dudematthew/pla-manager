import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { TourneyTeamEntity } from './team/entities/tourney-team.entity';

@Entity({
    name: 'tourney',
})
export class TourneyEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({
        type: 'longtext',
    })
    description: string;

    @Column({ 
        name: 'discord_description', 
        type: 'longtext',
    })
    discordDescription: string;

    @Column({ name: 'image_link' })
    imageLink: string;

    @Column({ name: 'thumbnail_link' })
    thumbnailLink: string;

    @Column({ 
        name: "start_date", 
        type: "datetime", 
        default: () => "CURRENT_TIMESTAMP",
    })
    startDate: Date;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @OneToMany(() => TourneyTeamEntity, team => team.tourney)
    teams: TourneyTeamEntity[];
}
