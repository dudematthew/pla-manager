import { Entity, ManyToOne, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert } from 'typeorm';
import { TourneyEntity } from '../../tourney.entity';

@Entity({
    name: 'tourney_team',
})
export class TourneyTeamEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    number: number;

    @Column()
    name: string;
    
    @Column()
    logoLink: string;
    
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
    
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
    
    @ManyToOne(() => TourneyEntity, tourney => tourney.teams)
    tourney: TourneyEntity;
}
