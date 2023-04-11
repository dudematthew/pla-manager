import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';


@Entity({
    name: 'user',
    schema: 'public'
})
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: string;

    @Column({
        unique: true,
    })
    discordId: string;
}
