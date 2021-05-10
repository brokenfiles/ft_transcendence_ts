import {
    BeforeInsert,
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn
} from "typeorm";
import {Guild} from "../../guilds/entities/guild.entity";
import * as bcrypt from 'bcrypt';

@Entity("users")
export class User {

    @PrimaryGeneratedColumn()
    id: number

    @Column({
        unique: true
    })
    display_name: string

    @ManyToOne(type => Guild)
    @JoinColumn()
    guild: Guild

    @Column({
        default: null,
        unique: true
    })
    login: string

    @Column({default: 0})
    role: number

    @Column({default: 0})
    points: number

    @Column({default: null})
    avatar: string

    @Column({default: null})
    oauth_token: string

    @Column({default: false})
    double_auth: boolean

    @Column({type: "timestamp", default: () => "CURRENT_TIMESTAMP"})
    banned: Date

    @Column({default: null})
    ban_reason: string

    @Column({default: null})
    password: string

    // @BeforeInsert() async hashPassword() {
    //     this.password = await bcrypt.hash(this.password, 10)
    // }
}
