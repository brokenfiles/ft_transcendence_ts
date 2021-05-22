import {IsNotEmpty, Length} from "class-validator";
import {User} from "../../users/entities/user.entity";

export class CreateGuildDto {

    @Length(3, 16)
    readonly name: string

    @Length(3, 5)
    readonly anagram: string

    @IsNotEmpty()
    readonly open: boolean = false

    @IsNotEmpty()
    readonly owner: User

}
