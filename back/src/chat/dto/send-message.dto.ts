import {IsNotEmpty} from "class-validator";

export class SendMessageDto {

    @IsNotEmpty()
    channel_id: number

    @IsNotEmpty()
    message: string

    @IsNotEmpty()
    user_id: number
}
