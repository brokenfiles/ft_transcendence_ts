import {
    Column,
    CreateDateColumn,
    Entity, Generated, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany,
    PrimaryGeneratedColumn, UpdateDateColumn
} from "typeorm";
import {User} from "../../users/entities/user.entity";
import {Message} from "./message.entity";

@Entity("channel")
export class Channel {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    @Generated("uuid")
    uuid: string

    @Column()
    name: string

    @CreateDateColumn()
    created_at: Date

    @Column()
    privacy: string

    @Column({
        nullable: true
    })
    password: string

    @UpdateDateColumn()
    updated_at: Date

    @ManyToMany(() => User, user => user.channels)
    @JoinTable()
    users: User[]

    @OneToMany(type => Message, message => message.channel)
    messages: Message[]

    @ManyToOne(() => User)
    @JoinColumn()
    owner: User
}
