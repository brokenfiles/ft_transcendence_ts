import {IsNotEmpty, IsNumber, IsOptional, IsString, Length} from "class-validator";

export class CreateChannelDto {

    @IsNotEmpty()
    @IsString()
    @Length(3, 16)
    name: string

    @IsNotEmpty()
    @IsString()
    privacy: string

    @IsOptional()
    @IsString()
    @Length(3, 16)
    password: string

    @IsOptional()
    users: number[]

}
