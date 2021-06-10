import {IsNotEmpty} from "class-validator";

export class SendMessageDto {

    @IsNotEmpty()
    channel: string

    @IsNotEmpty()
    message: string

    @IsNotEmpty()
    user_id: number
}
