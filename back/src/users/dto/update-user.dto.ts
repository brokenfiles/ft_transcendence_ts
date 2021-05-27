import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import {IsArray, IsBoolean, IsOptional, IsString, Length} from "class-validator";
import {Guild} from "../../guilds/entities/guild.entity";
import {Achievement} from "../../achievement/entities/achievement.entity";
import {Role} from "../../auth/roles/enums/role.enum";
import {User} from "../entities/user.entity";

export class UpdateUserDto extends PartialType(CreateUserDto) {

    @Length(3, 16)
    @IsOptional()
    readonly display_name: string

    @IsOptional()
    readonly guild: Guild

    @IsOptional()
    @IsBoolean()
    readonly double_auth: boolean

    @IsOptional()
    readonly points: number

    @IsOptional()
    @IsArray()
    readonly achievements: Achievement[]

    @IsOptional()
    @IsString()
    readonly role: Role

    @IsOptional()
    @IsArray()
    readonly friends: User[]

}
