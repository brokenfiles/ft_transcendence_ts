import {
    Column,
    CreateDateColumn,
    Entity, Generated, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne,
    PrimaryGeneratedColumn, UpdateDateColumn
} from "typeorm";
import {User} from "../../users/entities/user.entity";

@Entity("game")
export class Game {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    @Generated("uuid")
    uuid: string

    @ManyToMany(() => User, u => u.games)
    @JoinTable()
    players: User[]

    @Column()
    state: string

    @CreateDateColumn()
    created_at: Date

    @UpdateDateColumn()
    updated_at: Date
}
