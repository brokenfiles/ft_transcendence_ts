import {
    Column,
    Entity,
    JoinColumn, JoinTable, ManyToMany,
    ManyToOne, OneToMany, OneToOne,
    PrimaryGeneratedColumn
} from "typeorm";
import {Guild} from "../../guilds/entities/guild.entity";
import {Channel} from "../../chat/entities/channel.entity";
import {Message} from "../../chat/entities/message.entity";
import {Achievement} from "../../achievement/entities/achievement.entity";
import {Role} from "../../auth/roles/enums/role.enum";
import {JoinRequest} from "../../guilds/entities/join-request.entity";

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

    @ManyToOne(type => Guild, {
        onDelete: "SET NULL",
    })
    @JoinColumn()
    guild: Guild

    @OneToOne(type => JoinRequest, joinRequest => joinRequest.requester)
    joinRequest: JoinRequest


    @OneToMany(() => Message, message => message.owner)
    messages: Message[]

    @ManyToMany(() => Channel, channel => channel.users, {
        cascade: true
    })
    channels: Channel[]



    @ManyToMany(() => Achievement, achievement => achievement.users, {
        cascade: true
    })
    @JoinTable()
    achievements: Achievement[]

    @ManyToMany(() => User, user => user.friends)
    @JoinTable()
    friends: User[]

    @Column({
        default: null,
        unique: true
    })
    login: string

    @Column({default: Role.User})
    role: string

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
