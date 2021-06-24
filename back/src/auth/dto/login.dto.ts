import {IsNotEmpty, IsOptional, IsString} from "class-validator";

export class LoginDto {

    @IsNotEmpty()
    @IsString()
    readonly code: string

    @IsOptional()
    readonly double_auth_code: string

}
