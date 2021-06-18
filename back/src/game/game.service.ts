import {Injectable} from "@nestjs/common";
import {Coordinates, GameClass} from "./classes/game.classes";
import {Socket} from "socket.io";
import {SchedulerRegistry} from "@nestjs/schedule";
import {CreateGameInterface, PadInterface} from "./interfaces/game.interfaces";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {Game} from "./entity/game.entity";
import {UsersService} from "../users/users.service";
import {User} from "../users/entities/user.entity";
import {GameState} from "./enums/game-state.enum";
import {ClientJoinMatchInterface} from "../gateways/websocket/interfaces/client-join-match.interface";
import {WebsocketService} from "../gateways/websocket/websocket.service";

@Injectable()
export class GameService {

    games: GameClass[] = []

    constructor(@InjectRepository(Game) private gameRepository: Repository<Game>,
                private schedulerRegistry: SchedulerRegistry,
                private userService: UsersService,
                private websocketService: WebsocketService) {}

    /**
     * Init the game and return the uuid
     * @param {User[]} players
     */
    async initGame (players: User[]) : Promise<string> {
        let game = this.gameRepository.create()
        game.state = GameState.CREATING
        game.players = players
        const currGame = await this.gameRepository.save(game)
        this.games.push(new GameClass(currGame.uuid, game.players))
        return currGame.uuid
    }

    updatePadCoordinates(sub: number, coordinates: Coordinates) {
        const game = this.getGameByUserId(sub)
        if (game) {
            let pad = null
            if (game.players[0].id === sub) {
                pad = game.rightPad
            } else if (game.players[1].id === sub) {
                pad = game.leftPad
            }
            if (pad) {
                pad.setCoordinates(coordinates)
                for (const player of game.players) {
                    if (player.id !== sub) {
                        // envoyer aux users la nouvelle position du pad
                        this.websocketService.getClient(player.id).socket.emit('otherPlayerPadUpdated', coordinates)
                    }
                }
            }
        }
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


    getGameByUUID(uuid: string) : GameClass
    {
        for (let game of this.games)
        {
            if (game.uuid === uuid)
                return game
        }
        return null
    }

    getGameByUserId (userId: number) : GameClass {
        for (const game of this.games) {
            if (game.players.map(u => u.id).includes(userId)) {
                return game
            }
        }
        return null
    }

    clientJoinGame(client: Socket, payload: ClientJoinMatchInterface): GameClass | null {
        return this.getGameByUUID(payload.uuid)
    }
}
