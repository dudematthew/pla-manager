import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"

@Entity({
    name: 'apex_season',
})
export class ApexSeasonEntity extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'name', unique: true })
    name: string;

    @Column({ name: 'tagline', nullable: true })
    tagline: string;

    @Column({ name: 'current_split', nullable: true })
    currentSplit: number;

    @Column({ name: 'start_date', nullable: true, type: 'date' })
    startDate: Date;

    @Column({ name: 'end_date', nullable: true, type: 'date' })
    endDate: Date;
    
    @Column({ name: 'split_date', nullable: true, type: 'date' })
    splitDate: Date;

    @Column({ name: 'color', nullable: true })
    color: string;

    @Column({ name: 'link', nullable: true })
    link: string;

    @Column({ name: 'new_legend', nullable: true })
    newLegend: string;

    @Column({ name: 'new_weapon', nullable: true })
    newWeapon: string;

    @Column({ name: 'new_map', nullable: true })
    newMap: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
