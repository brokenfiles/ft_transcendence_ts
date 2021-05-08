import {
    BeforeInsert,
    BeforeUpdate,
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn
} from "typeorm";
import {Guild} from "../../guilds/entities/guild.entity";
import {Length, validateOrReject} from "class-validator";

@Entity("users")
export class User {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    display_name: string

    @ManyToOne(type => Guild)
    @JoinColumn()
    guild: Guild

    @Column({default: null})
    login: string

    @Column({default: 0})
    role: number

    @Column({default: 0})
    points: number

    @Column({default: null})
    oauth_token: string

    @Column({default: false})
    double_auth: boolean

    @Column({type: "timestamp", default: () => "CURRENT_TIMESTAMP"})
    banned: Date

    @Column({default: null})
    ban_reason: string

}
