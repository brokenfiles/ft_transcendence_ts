import {IsNotEmpty, IsString} from "class-validator";

export class FakeloginDto {

    @IsNotEmpty()
    @IsString()
    readonly pseudo: string

}
