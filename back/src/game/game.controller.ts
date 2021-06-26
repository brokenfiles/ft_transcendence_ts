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
    findAll (@Req() request) : Promise<Game[]> {
        return this.gameService.findPlayingGames()
    }

    @Get('users/:id')
    async findAllFromUser (@Req() request, @Param('id', ParseIntPipe) id: number) {
        const page = request.query.page || 0
        return this.gameService.findAllFromUser(id, page)
    }

    @Get('guilds/:id')
    async findAllFromGuild (@Req() request, @Param('id', ParseIntPipe) id: number) {
        const page = request.query.page || 0
        return this.gameService.findAllFromGuild(id, page)
    }

    @Get('statistics/:id')
    async findStatistics (@Param('id', ParseIntPipe) id: number) {
        return this.gameService.findStatistics(id)
    }

    @Get(':uuid')
    findOne (@Param('uuid') uuid: string) : Promise<Game> {
        return this.gameService.findOne(uuid)
    }

}
