import {IsNotEmpty, IsOptional, IsString} from "class-validator";

export class LoginDto {

    // @IsNotEmpty()
    @IsOptional()
    @IsString()
    readonly code: string

    // @IsNotEmpty()
    @IsOptional()
    @IsString()
    readonly guest_name: string

}
