import {IsEmpty, IsNotEmpty, IsOptional, Length} from "class-validator";
import {User} from "../../users/entities/user.entity";
import {IsNull} from "typeorm";

export class CreateGuildDto {

    @Length(3, 16)
    readonly name: string

    @IsOptional()
    @Length(10, 80)
    readonly description: string

    @Length(3, 5)
    readonly anagram: string

    @IsOptional()
    readonly open: boolean = false

    owner: User

    users: User[]

}
