import {
    Column,
    CreateDateColumn,
    Entity, JoinTable, ManyToMany, OneToMany,
    PrimaryGeneratedColumn, UpdateDateColumn
} from "typeorm";
import {User} from "../../users/entities/user.entity";
import {Message} from "./message.entity";

@Entity("channel")
export class Channel {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @CreateDateColumn()
    created_at: Date

    @UpdateDateColumn()
    updated_at: Date

    @ManyToMany(() => User, user => user.channels)
    @JoinTable()
    users: User[]

    @OneToMany(type => Message, message => message.channel)
    messages: Message[]
}