import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
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

    @Column({type: "timestamp", default: () => "CURRENT_TIMESTAMP"})
    created_at: Date

}
