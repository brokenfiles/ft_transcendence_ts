import {Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {User} from "../../users/entities/user.entity";
import {Message} from "./message.entity";

@Entity("channel")
export class Channel {

    @PrimaryGeneratedColumn()
    id: number

    @Column({
        default: null
    })
    name: string

    @Column({
        default: false
    })
    open: boolean

    @ManyToMany(() => User)
    @JoinTable()
    users: User[]

    @OneToMany(type => Message, message => message.channel)
    messages: Message[]

}
