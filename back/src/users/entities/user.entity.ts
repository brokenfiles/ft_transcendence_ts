import {
    Column,
    Entity,
    JoinColumn, ManyToMany,
    ManyToOne, OneToMany,
    PrimaryGeneratedColumn
} from "typeorm";
import {Guild} from "../../guilds/entities/guild.entity";
import {Channel} from "../../chat/entities/channel.entity";
import {Message} from "../../chat/entities/message.entity";

@Entity("users")
export class User {

    @PrimaryGeneratedColumn()
    id: number

    @Column({
        unique: true
    })
    display_name: string

    @Column({ default: null })
    first_name: string

    @ManyToOne(type => Guild)
    @JoinColumn()
    guild: Guild

    @OneToMany(type => Message, message => message.owner)
    messages: Message[]

    @ManyToMany(() => Channel, channel => channel.users, {
        cascade: true
    })
    channels: Channel[]

    @Column({
        default: null,
        unique: true
    })
    login: string

    @Column({default: false})
    admin: boolean

    @Column({default: 0})
    points: number

    @Column({default: null})
    avatar: string

    @Column({default: false})
    double_auth: boolean

    @Column({type: "timestamp", default: () => "CURRENT_TIMESTAMP"})
    banned: Date

    @Column({default: null})
    ban_reason: string

}
