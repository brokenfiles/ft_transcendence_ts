import {Column, OneToOne, Unique} from "typeorm";
import {Guild} from "../../guilds/entities/guild.entity";
import {IsNotEmpty, IsOptional} from "class-validator";

export class CreateUserDto {

    @IsNotEmpty()
    display_name: string

    @IsOptional()
    guild: Guild

    @IsOptional()
    avatar: string

    @IsNotEmpty()
    first_name: string

    @IsNotEmpty()
    login: string

    @IsNotEmpty()
    email: string

    @IsOptional()
    double_auth: boolean

    set_display_name(value: string) {
        this.display_name = value
        return this
    }

    set_guild(value: Guild) {
        this.guild = value
        return this
    }

    set_avatar(value: string) {
        this.avatar = value
        return this
    }

    set_first_name(value: string) {
        this.first_name = value
        return this
    }

    set_login(value: string) {
        this.login = value
        return this
    }

    set_double_auth(value: boolean) {
        this.double_auth = value
        return this
    }

    set_email(value: string) {
        this.email = value
        return this
    }


}
