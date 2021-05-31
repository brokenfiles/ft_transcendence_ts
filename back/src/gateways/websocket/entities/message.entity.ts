import {Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {Channel} from "./channel.entity";
import {User} from "../../../users/entities/user.entity";

@Entity("message")
export class Message {

    @PrimaryGeneratedColumn()
    id: number

    @Column({
        default: null
    })
    text: string

    @ManyToOne(type => Channel)
    @JoinColumn()
    channel: Channel

    @ManyToOne(type => User)
    @JoinColumn()
    owner: User

    @CreateDateColumn()
    created_at: Date

}
