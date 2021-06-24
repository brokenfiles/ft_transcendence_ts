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
import {Picture} from "../../cdn/entites/picture.entity";
import {Game} from "../../game/entity/game.entity";

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

    @OneToMany(type => Picture, p => p.user)
    pictures: Picture[]

    @OneToMany(() => Message, message => message.owner)
    messages: Message[]

    @OneToMany(() => Channel, channel => channel.owner)
    channels_owned: Channel[]

    @ManyToMany(() => Channel, channel => channel.users, {
        cascade: true,
        onDelete: "SET NULL"
    })
    channels: Channel[]

    @ManyToMany(() => Game, game => game.players, {
        cascade: true,
        onDelete: "SET NULL"
    })
    games: Game[]

    @ManyToMany(() => Channel, channel => channel.banned_users)
    banned_channels: Channel[]

    @ManyToMany(() => Channel, channel => channel.administrators)
    channels_admin: Channel[]


    @Column("int", { array: true })
    users_id_blocked: number[]


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

    @Column({default: 0.0, type: "float"})
    points: number

    @Column({default: 1100})
    elo: number

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
