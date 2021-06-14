import {Column, Entity, Generated, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {User} from "../../users/entities/user.entity";

@Entity()
export class Picture {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    @Generated("uuid")
    uuid: string

    @ManyToOne(type => User, u => u.pictures)
    @JoinColumn()
    user: User

    @Column()
    name: string

    @Column()
    extension: string

}
