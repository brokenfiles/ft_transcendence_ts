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


    @OneToOne(() => User)
    @JoinColumn()
    player1: User

    @OneToOne(() => User)
    @JoinColumn()
    player2: User

    @Column()
    state: string

    @CreateDateColumn()
    created_at: Date

    @UpdateDateColumn()
    updated_at: Date
}
