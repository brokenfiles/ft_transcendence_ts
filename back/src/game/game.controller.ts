import {Body, Controller, Get, Param, ParseIntPipe, Post, Req, UseGuards} from "@nestjs/common";
import {GameService} from "./game.service";
import {RolesGuard} from "../auth/roles/roles.guard";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {Roles} from "../auth/roles/roles.decorator";
import {Role} from "../auth/roles/enums/role.enum";
import {Game} from "./entity/game.entity";
import {Request} from "express";

@Controller('games')
export class GameController {

    constructor(private readonly gameService: GameService) {}

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Administrator, Role.Moderator)
    findAll (@Req() request) : Promise<Game[]> {
        return this.gameService.findAll()
    }

    @Get('users/:id')
    async findAllFromUser (@Req() request, @Param('id', ParseIntPipe) id: number) {
        const page = request.query.page || 0
        return this.gameService.findAllFromUser(id, page)
    }

    @Get(':uuid')
    findOne (@Param('uuid') uuid: string) : Promise<Game> {
        return this.gameService.findOne(uuid)
    }

}
