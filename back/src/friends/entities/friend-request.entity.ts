import {Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "../../users/entities/user.entity";

@Entity()
export class FriendRequest {

    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(type => User)
    @JoinColumn()
    requester: User

    @ManyToOne(type => User)
    @JoinColumn()
    requested: User

}
