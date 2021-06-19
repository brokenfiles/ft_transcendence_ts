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

    async clientReadyToPlay(sub: number) {
        const game = this.getGameByUserId(sub)
        if (game) {


            let user = null
            if (game.players[0].id === sub)
                user = game.players[0]
            else if (game.players[1].id === sub)
                user = game.players[1]
            if (user) {
                if (!game.playersReady.includes(user)) {
                    game.addReady(user)
                    if (game.playersReady.length === 2) {
                        const interval = setInterval(() => this.updateGame(game), 20)
                        this.schedulerRegistry.addInterval(game.uuid, interval);
                    }
                }
            }
        }
    }

    private updateGame (game: GameClass) {
        let updated = false
        game.ball.coordinates.x += game.ball.xSpeed
        game.ball.coordinates.y += game.ball.ySpeed
        if (game.ball.coordinates.y <= 0 || game.ball.coordinates.y + 10 >= 480) {
            game.ball.ySpeed *= -1
            updated = true
        }
        if (game.ball.coordinates.x <= 0 || game.ball.coordinates.x + 10 >= 640) {
            let winner
            if (game.ball.coordinates.x <= 0)
                winner = game.players[0]
            else
                winner = game.players[1]
            game.ball.xSpeed *= -1
            updated = true
            this.websocketService.getClient(game.players[0].id).socket.emit("GameStop", winner)
            this.websocketService.getClient(game.players[1].id).socket.emit("GameStop", winner)
            this.schedulerRegistry.deleteInterval(game.uuid);
            game.resetGame()
        }

        //collisions with pad

        if (game.ball.coordinates.x >= game.rightPad.coordinates.x - 10 && game.ball.coordinates.x <= game.rightPad.coordinates.x &&
            game.ball.coordinates.y >= game.rightPad.coordinates.y && game.ball.coordinates.y <= game.rightPad.coordinates.y + 74)
        {
            updated = true
            game.ball.xSpeed *= -1
        }

        if (game.ball.coordinates.x - 10 <= game.leftPad.coordinates.x && game.ball.coordinates.x >= game.leftPad.coordinates.x &&
            game.ball.coordinates.y >= game.leftPad.coordinates.y && game.ball.coordinates.y <= game.leftPad.coordinates.y + 74)
        {
            updated = true
            game.ball.xSpeed *= -1
        }

        if (updated) {
            for (const player of game.players) {
                this.websocketService.getClient(player.id).socket.emit('ballUpdated', game.ball)
                this.websocketService.getClient(player.id).socket.emit('padUpdated', {
                    rightPad: game.rightPad,
                    leftPad: game.leftPad
                })
            }
        }
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