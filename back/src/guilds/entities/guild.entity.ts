import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn, UpdateDateColumn
} from "typeorm";
import {type} from "os";
import {User} from "../../users/entities/user.entity";

@Entity()
export class Guild {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column({default: null})
    anagram: string

    @Column({default: 0})
    points: number

    @Column({default: 0})
    war_points: number

    @Column({default: false})
    open: boolean

    @OneToMany(type => User, user => user.guild)
    users: User[]

    @OneToOne(type => User)
    @JoinColumn()
    owner: User

    @CreateDateColumn()
    created_at: Date

    @UpdateDateColumn()
    updated_at: Date

}
