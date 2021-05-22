import {IsArray, IsOptional, Length} from "class-validator";
import {User} from "../../users/entities/user.entity";

export class UpdateAchievementDto {

    @IsOptional()
    @Length(3, 16)
    name: string

    @IsOptional()
    @IsArray()
    users: User[]

}
