import {IsBoolean, IsOptional, IsString, Length} from "class-validator";
import {Guild} from "../../guilds/entities/guild.entity";
import {IsImage} from "../../validations/is-image.validator";

export class UpdateMeDto {

    @IsOptional()
    @IsString()
    @Length(3, 16)
    display_name: string

    @IsOptional()
    guild: Guild

    @IsOptional()
    @IsBoolean()
    double_auth: boolean

    @IsOptional()
    @IsImage()
    avatar: string

}
