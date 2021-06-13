import {
    Column,
    Entity,
    JoinColumn, JoinTable, ManyToMany,
    ManyToOne, OneToMany,
    PrimaryGeneratedColumn
} from "typeorm";
import {Guild} from "../../guilds/entities/guild.entity";
import {Channel} from "../../chat/entities/channel.entity";
import {Message} from "../../chat/entities/message.entity";
import {Achievement} from "../../achievement/entities/achievement.entity";
import {Role} from "../../auth/roles/enums/role.enum";

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

    @ManyToOne(type => Guild, {
        onDelete: "SET NULL"
    })
    @JoinColumn()
    guild_request: Guild

    @OneToMany(() => Message, message => message.owner)
    messages: Message[]

    @OneToMany(() => Channel, channel => channel.owner)
    channels_owned: Channel[]

    @ManyToMany(() => Channel, channel => channel.users, {
        cascade: true,
        onDelete: "SET NULL"
    })
    channels: Channel[]

    @ManyToMany(() => Channel, channel => channel.banned_users)
    banned_channels: Channel[]

    @ManyToMany(() => Channel, channel => channel.administrator)
    channels_admin: Channel[]

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

    @Column({type: "timestamp", default: () => "CURRENT_TIMESTAMP"})
    blocked: Date

    @Column({default: null})
    ban_reason: string

}
