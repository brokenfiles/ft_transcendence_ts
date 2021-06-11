import {IsObject} from "class-validator";
import {User} from "../../users/entities/user.entity";

export class KickUserDto {

    @IsObject()
    user: User

}
