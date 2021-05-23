import {IsOptional, IsString, Length} from "class-validator";

export class CreateAchievementDto {

    @IsString()
    @Length(3, 16)
    name: string

    @IsString()
    color: string

    @IsString()
    description: string

}
