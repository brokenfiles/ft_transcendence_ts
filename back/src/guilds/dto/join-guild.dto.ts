import {IsObject} from "class-validator";
import {Guild} from "../entities/guild.entity";

export class JoinGuildDto {

    @IsObject()
    guild: Guild

}
