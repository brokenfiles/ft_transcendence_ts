import {Column, OneToOne, Unique} from "typeorm";
import {Guild} from "../../guilds/entities/guild.entity";
import {IsNotEmpty, IsString, Length} from "class-validator";

export class CreateUserDto {

    @Length(3, 16)
    readonly display_name: string

    readonly guild: Guild

    @IsNotEmpty()
    readonly login: string

    @IsString()
    @IsNotEmpty()
    @Length(5, 30)
    readonly password: string

    readonly oauth_token: string
    readonly double_auth: boolean

}
