import {IsObject} from "class-validator";
import {User} from "../../users/entities/user.entity";

export class AcceptRequestDto {

    @IsObject()
    requester: User

}
