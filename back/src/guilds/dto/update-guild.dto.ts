import {IsOptional, Length} from "class-validator";
import {User} from "../../users/entities/user.entity";

export class UpdateGuildDto {

    @Length(3, 16)
    @IsOptional()
    readonly name: string

    @Length(3, 5)
    @IsOptional()
    readonly anagram: string

    @IsOptional()
    readonly owner: User

    @IsOptional()
    readonly open: boolean

}
