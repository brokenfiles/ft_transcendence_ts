import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import {IsNotEmpty, Length} from "class-validator";
import {Guild} from "../../guilds/entities/guild.entity";

export class UpdateUserDto extends PartialType(CreateUserDto) {

    @Length(3, 16)
    readonly display_name: string

    readonly guild: Guild

    @IsNotEmpty()
    readonly login: string

    readonly oauth_token: string
    readonly double_auth: boolean

}
