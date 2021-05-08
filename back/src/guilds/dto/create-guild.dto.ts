import {Length} from "class-validator";

export class CreateGuildDto {

    @Length(3, 16)
    name: string

    @Length(3, 5)
    anagram: string

    open: boolean = false

}
