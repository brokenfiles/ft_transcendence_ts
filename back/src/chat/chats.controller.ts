import {Controller, Get, HttpException, HttpStatus, Param, Req, Res, UseGuards} from "@nestjs/common";
import {ChatsService} from "./chats.service";
import {Response} from 'express';
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {UsersService} from "../users/users.service";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {User} from "../users/entities/user.entity";

@Controller('chat')
export class ChatsController {

    constructor(private readonly chatsService : ChatsService,
                private readonly userService : UsersService,
                @InjectRepository(User) private userRepository: Repository<User>) {}

    @Get("block/:id")
    @UseGuards(JwtAuthGuard)
    async banOne(@Param('id') id: number, @Req() request, @Res() res: Response) {

        let curr_user
        let ban_user
        curr_user = await this.userService.findOne(request.user.sub)
        ban_user = await this.userService.findOne(id)

        let blocked: boolean

        if (ban_user.id === request.user.sub) {
            throw new HttpException('Not modified', HttpStatus.BAD_REQUEST);
        }

        if (curr_user.users_blocked.map((u) => u.id).includes(ban_user.id)) {
            curr_user.users_blocked = curr_user.users_blocked.filter((u) => u.id !== ban_user.id)
            blocked = false
        }
        else
        {
            curr_user.users_blocked.push(ban_user)
            blocked = true
        }

        await this.userRepository.save(curr_user)

        console.log("noooo")
        console.log(curr_user.users_blocked)
        console.log(ban_user.users_blocked)
        console.log("noooo")

        return res.status(HttpStatus.OK).json({
            blocked
        })
    }

}