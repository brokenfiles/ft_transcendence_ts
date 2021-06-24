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
    async blockOne(@Param('id') id: number, @Req() request, @Res() res: Response) {

        let curr_user
        let ban_user
        curr_user = await this.userService.findOne(request.user.sub)
        ban_user = await this.userService.findOne(id)

        let blocked: boolean

        if (curr_user && ban_user)
        {
            if (!curr_user.users_id_blocked)
                curr_user.users_id_blocked = []

            if (ban_user.id === request.user.sub) {
                throw new HttpException('Not modified', HttpStatus.BAD_REQUEST);
            }

            if (!curr_user.users_id_blocked.includes(ban_user.id)) {
                blocked = true
                curr_user.users_id_blocked.push(ban_user.id)
            }
            else {
                blocked = false
                curr_user.users_id_blocked = curr_user.users_id_blocked.filter((u) => u !== ban_user.id)
            }
            await this.userRepository.save(curr_user)
        }
        else
            throw new HttpException('Bad Users', HttpStatus.BAD_REQUEST);

        return res.status(HttpStatus.OK).json({
            blocked
        })
    }

    @Get("isblocked/:id")
    @UseGuards(JwtAuthGuard)
    async isBlocked(@Param('id') id: number, @Req() request, @Res() res: Response) {

        let curr_user
        let ban_user
        curr_user = await this.userService.findOne(request.user.sub)
        ban_user = await this.userService.findOne(id)

        let state = false
        if (curr_user.users_id_blocked)
            state = (curr_user && curr_user.users_id_blocked.length && curr_user.users_id_blocked.includes(ban_user.id));
        return res.status(HttpStatus.OK).json({
            blocked: state
        })
    }
}
