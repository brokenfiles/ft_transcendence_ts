import {User} from "../../users/entities/user.entity";
import {IsObject} from "class-validator";

export class RemoveFriendDto {

    @IsObject()
    friend: User

}
