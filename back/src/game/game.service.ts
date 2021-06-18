import {Injectable} from "@nestjs/common";
import {GameClass} from "./classes/game.classes";
import {Socket} from "socket.io";
import {SchedulerRegistry} from "@nestjs/schedule";
import {CreateGameInterface, PadInterface} from "./interfaces/game.interfaces";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {Game} from "./entity/game.entity";
import {UsersService} from "../users/users.service";
import {User} from "../users/entities/user.entity";
import {GameState} from "./enums/game-state.enum";

@Injectable()
export class GameService {

    games: GameClass[]

    constructor(@InjectRepository(Game) private gameRepository: Repository<Game>,
                private schedulerRegistry: SchedulerRegistry,
                private userService: UsersService) {}

    /**
     * Init the game and return the uuid
     * @param {User[]} players
     */
    async initGame (players: User[]) : Promise<string> {
        let game = this.gameRepository.create()
        game.state = GameState.CREATING
        game.player1 = players[0]
        game.player2 = players[1]

        return (await this.gameRepository.save(game)).uuid
    }

    async createGame(payload: CreateGameInterface) {

        const p1 = await this.userService.findOne(payload.p1)
        const p2 = await this.userService.findOne(payload.p2)

        let game = this.gameRepository.create()
        game.state = "creating"
        game.player1 = p1
        game.player2 = p2
        game = await this.gameRepository.save(game)

        this.games.push(new GameClass(payload))
    }

    updatePadCoordinates(padPayload: PadInterface) {
        // this.game.rightPad.setCoordinates(padPayload)
    }

    userIsReady(client: Socket, state: boolean) : boolean {

        if (state === true) {
            const interval = setInterval(() => {

                // if (this.game.ball.updatePosition(this.game))
                // {
                //     client.emit("BallHit", this.game.ball)
                // }
            }, 20);
            this.schedulerRegistry.addInterval("game", interval);
        }
        else
        {
            this.schedulerRegistry.deleteInterval("game");
        }
        const intervals = this.schedulerRegistry.getIntervals();
        console.log(intervals)
        return state
    }
}
