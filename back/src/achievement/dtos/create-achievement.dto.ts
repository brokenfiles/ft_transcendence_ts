import {IsArray, IsString, Length} from "class-validator";
import {User} from "../../users/entities/user.entity";

export class CreateAchievementDto {

    @IsString()
    @Length(3, 16)
    name: string

}
