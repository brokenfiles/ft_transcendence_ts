import {IsOptional, Length} from "class-validator";
import {User} from "../../users/entities/user.entity";

export class CreateGuildDto {

    @Length(3, 16)
    readonly name: string

    @IsOptional()
    @Length(1, 80)
    readonly description: string

    @Length(3, 5)
    readonly anagram: string

    @IsOptional()
    readonly open: boolean = false

    owner: User

    users: User[]

}
