import { ISession } from "connect-typeorm";
import { BaseEntity, Column, DeleteDateColumn, Entity, Index, PrimaryColumn } from "typeorm";

@Entity({ name: 'sessions' })
export class TypeORMSession extends BaseEntity implements ISession {

    @Index()
    @Column('bigint')
    expiredAt: number;
    
    @PrimaryColumn('varchar', { length: 255 })
    id: string;

    @DeleteDateColumn()
    public destroyedAt?: Date;

    @Column('text')
    json: string;
}