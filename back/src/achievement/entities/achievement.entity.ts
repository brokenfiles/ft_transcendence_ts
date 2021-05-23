import {Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn} from "typeorm";
import {User} from "../../users/entities/user.entity";

@Entity()
export class Achievement {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column({
        default: 'A sample description'
    })
    description: string

    @Column({
        default: '#FFFFFF'
    })
    color: string

    @ManyToMany(() => User, user => user.achievements)
    users: User[]

}
