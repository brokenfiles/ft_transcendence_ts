import {Body, Controller, Get, Param, Post, Req, UseGuards} from "@nestjs/common";
import {GameService} from "./game.service";
import {RolesGuard} from "../auth/roles/roles.guard";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {Roles} from "../auth/roles/roles.decorator";
import {Role} from "../auth/roles/enums/role.enum";
import {Game} from "./entity/game.entity";

@Controller('games')
export class GameController {

    constructor(private readonly gameService: GameService) {}

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Administrator, Role.Moderator)
    findAll () : Promise<Game[]> {
        return this.gameService.findAll()
    }

    @Get(':uuid')
    findOne (@Param('uuid') uuid: string) : Promise<Game> {
        return this.gameService.findOne(uuid)
    }

}
