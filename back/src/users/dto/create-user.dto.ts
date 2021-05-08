import {Column, OneToOne} from "typeorm";
import {Guild} from "../../guilds/entities/guild.entity";
import {IsNotEmpty, Length} from "class-validator";

export class CreateUserDto {

    @Length(3, 16)
    readonly display_name: string

    readonly guild: Guild

    @IsNotEmpty()
    readonly login: string

    readonly oauth_token: string
    readonly double_auth: boolean

}
