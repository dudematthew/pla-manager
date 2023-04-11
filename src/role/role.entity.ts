import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';

@Entity({
    name: 'role',
    schema: 'public'
})
export class Role extends BaseEntity {
    @PrimaryGeneratedColumn() 
    id: string;

    @Column()
    name: string;

    @Column()
    discordId: string;
}
