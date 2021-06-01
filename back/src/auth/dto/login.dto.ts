import {IsNotEmpty, IsString} from "class-validator";

export class LoginDto {

    @IsNotEmpty()
    @IsString()
    readonly code: string

}
