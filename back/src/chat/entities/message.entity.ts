import {
    Column,
    CreateDateColumn,
    Entity, JoinColumn, ManyToOne,
    PrimaryGeneratedColumn, UpdateDateColumn
} from "typeorm";
import {User} from "../../users/entities/user.entity";
import {Channel} from "./channel.entity";

@Entity("message")
export class Message {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    text: string

    @CreateDateColumn()
    created_at: Date

    @UpdateDateColumn()
    updated_at: Date

    @ManyToOne(() => User, user => user.messages)
    @JoinColumn()
    owner: User

    @ManyToOne(() => Channel)
    @JoinColumn()
    channel: Channel

}
