import {Column, OneToOne, Unique} from "typeorm";
import {Guild} from "../../guilds/entities/guild.entity";
import {IsNotEmpty} from "class-validator";

export class CreateUserDto {

    display_name: string

    guild: Guild

    avatar: string

    first_name: string

    @IsNotEmpty()
    login: string

    double_auth: boolean

}
