import {
    Column,
    CreateDateColumn,
    Entity, Generated, JoinTable, ManyToMany,
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

    @CreateDateColumn()
    created_at: Date

    @UpdateDateColumn()
    updated_at: Date
}
