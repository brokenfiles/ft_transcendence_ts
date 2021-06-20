import {Injectable} from "@nestjs/common";
import {Coordinates, GameClass} from "./classes/game.classes";
import {Socket} from "socket.io";
import {SchedulerRegistry} from "@nestjs/schedule";
import {CreateGameInterface, MatchInterface, PadInterface} from "./interfaces/game.interfaces";
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
        const game = new GameClass(players, this.websocketService,
            this.gameRepository, this.schedulerRegistry)
        await game.init()
        // save the game in the database to get the uuid
        this.games.push(game)
        return (game.uuid)
    }

    async clientReadyToPlay(sub: number) {
        const game = this.getGameByUserId(sub)
        if (game) {
            game.setPlayerReady(sub)
        }
    }

    updatePadCoordinates(sub: number, coordinates: Coordinates) {
        const game = this.getGameByUserId(sub)
        if (game) {
            game.updatePad(sub, coordinates)
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
                winner = game.players[1]
            else
                winner = game.players[0]
            game.ball.xSpeed *= -1
            this.websocketService.getClient(game.players[0].id).socket.emit("GameStop", winner)
            this.websocketService.getClient(game.players[1].id).socket.emit("GameStop", winner)
            this.schedulerRegistry.deleteInterval(game.uuid);
            // game.resetGame()
            for (const player of game.players) {
                this.websocketService.getClient(player.id).socket.emit('ballUpdated', game.ball)
                this.websocketService.getClient(player.id).socket.emit('padUpdated', {
                    rightPad: game.rightPad,
                    leftPad: game.leftPad
                })
            }
        }

        //collisions with pad

        if (game.ball.coordinates.x >= game.rightPad.coordinates.x - 10 && game.ball.coordinates.x <= game.rightPad.coordinates.x &&
            game.ball.coordinates.y >= game.rightPad.coordinates.y && game.ball.coordinates.y <= game.rightPad.coordinates.y + 74)
        {
            game.ball.xSpeed *= -1
            if (game.ball.xSpeed < 0) {
                game.ball.xSpeed -= 0.3
            } else {
                game.ball.xSpeed += 0.3
            }
            if (game.ball.ySpeed < 0) {
                game.ball.ySpeed -= 0.3
            } else {
                game.ball.ySpeed += 0.3
            }
        }

        if (game.ball.coordinates.x - 10 <= game.leftPad.coordinates.x && game.ball.coordinates.x >= game.leftPad.coordinates.x &&
            game.ball.coordinates.y >= game.leftPad.coordinates.y && game.ball.coordinates.y <= game.leftPad.coordinates.y + 74)
        {
            game.ball.xSpeed *= -1
            if (game.ball.xSpeed < 0) {
                game.ball.xSpeed -= 0.3
            } else {
                game.ball.xSpeed += 0.3
            }
            if (game.ball.ySpeed < 0) {
                game.ball.ySpeed -= 0.3
            } else {
                game.ball.ySpeed += 0.3
            }
        }

        // if (updated) {
            for (const player of game.players) {
                this.websocketService.getClient(player.id).socket.emit('ballUpdated', game.ball)
            }
        // }
    }

    getGameByUUID(uuid: string) : GameClass | null
    {
        for (let game of this.games)
        {
            if (game.uuid === uuid) {
                return game
            }
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

    getGameBySocketAndUUID(client: Socket, payload: ClientJoinMatchInterface): MatchInterface | null {
        const game = this.getGameByUUID(payload.uuid)
        if (!game)
            return null
        return game.serialize()
    }

    removeGameFromGameArray(uuid: string)
    {
        const index = this.games.map((game) => game.uuid).indexOf(uuid)
        if (index !== -1)
            this.games.splice(index, 1)
    }

    clientLeave(client: Socket) {
        const clientIdx = this.websocketService.clients.map(c => c.id).indexOf(client.id)
        if (clientIdx !== -1) {
            const client = this.websocketService.clients[clientIdx]
            const sub = client.userId

            let game
            if ((game = this.getGameByUserId(sub)))
            {
                let winner
                if (game.players[0].id === sub)
                    winner = game.players[1]
                else
                    winner = game.players[0]

                this.websocketService.getClient(winner.id).socket.emit("GameStop", winner)
                console.log(this.schedulerRegistry.getIntervals())
                // this.schedulerRegistry.deleteInterval(game.uuid);
                game.resetGame()
                this.websocketService.getClient(winner.id).socket.emit('ballUpdated', game.ball)
                this.websocketService.getClient(winner.id).socket.emit('padUpdated', {
                    rightPad: game.rightPad,
                    leftPad: game.leftPad
                })
                this.removeGameFromGameArray(game.uuid)
            }
        }
    }
}
