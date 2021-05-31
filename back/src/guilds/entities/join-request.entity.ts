import {Entity, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "../../users/entities/user.entity";

@Entity()
export class JoinRequest {

    @PrimaryGeneratedColumn()
    id: number

    @OneToOne(type => User, user => user.joinRequest)
    requester: User

}
