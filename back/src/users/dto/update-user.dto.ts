import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import {IsNotEmpty, IsOptional, Length} from "class-validator";
import {Guild} from "../../guilds/entities/guild.entity";

export class UpdateUserDto extends PartialType(CreateUserDto) {

    @Length(3, 16)
    @IsOptional()
    readonly display_name: string

    readonly guild: Guild

    @IsNotEmpty()
    @IsOptional()
    readonly login: string

    readonly oauth_token: string
    readonly double_auth: boolean

}
