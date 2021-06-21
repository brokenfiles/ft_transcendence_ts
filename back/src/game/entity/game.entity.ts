import {
    Column,
    CreateDateColumn,
    Entity, Generated, JoinColumn, JoinTable, ManyToMany, ManyToOne,
    PrimaryGeneratedColumn, UpdateDateColumn
} from "typeorm";
import {User} from "../../users/entities/user.entity";
import {GameState} from "../enums/game-state.enum";

@Entity("game")
export class Game {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    @Generated("uuid")
    uuid: string

    @Column({default: GameState.IN_GAME})
    state: string

    @ManyToMany(() => User, u => u.games)
    @JoinTable()
    players: User[]

    @ManyToOne(() => User)
    @JoinColumn()
    winner: User

    @ManyToOne(() => User)
    @JoinColumn()
    looser: User

    @Column({default: 0})
    winner_points: number

    @Column({default: 0})
    looser_points: number

    @CreateDateColumn()
    created_at: Date

    @UpdateDateColumn()
    updated_at: Date
}
