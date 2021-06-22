import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {Coordinates, GameClass} from "./classes/game.classes";
import {Socket} from "socket.io";
import {SchedulerRegistry} from "@nestjs/schedule";
import {MatchInterface} from "./interfaces/game.interfaces";
import {InjectRepository} from "@nestjs/typeorm";
import {In, Repository} from "typeorm";
import {Game} from "./entity/game.entity";
import {UsersService} from "../users/users.service";
import {User} from "../users/entities/user.entity";
import {GameState} from "./enums/game-state.enum";
import {ClientJoinMatchInterface} from "../gateways/websocket/interfaces/client-join-match.interface";
import {WebsocketService} from "../gateways/websocket/websocket.service";
import {Contains} from "class-validator";

@Injectable()
export class GameService {

    games: GameClass[] = []

    constructor(@InjectRepository(Game) private gameRepository: Repository<Game>,
                private schedulerRegistry: SchedulerRegistry,
                private userService: UsersService,
                private websocketService: WebsocketService) {
        const interval_id = setInterval(() => this.checkGames(), 1000)
        this.schedulerRegistry.addInterval('checkGames', interval_id)
    }

    async findAll() : Promise<Game[]> {
        return this.gameRepository.find({
            where: { state: GameState.FINISHED },
            relations: ['winner', 'looser']
        })
    }

    findAllFromUser(id: number, page: number) {
        return this.gameRepository.find({
            where: [
                {
                    state: GameState.FINISHED,
                    looser: id,
                },
                {
                    state: GameState.FINISHED,
                    winner: id,
                },
            ],
            skip: 10 * page,
            take: 10,
            order: { created_at: "DESC" },
            relations: ['winner', 'looser'],
        })
    }

    async findOne (uuid: string) : Promise<Game> {
        return this.gameRepository.findOneOrFail({
            where: { uuid, state: GameState.FINISHED },
            relations: ['winner', 'looser', 'players']
        }).catch(e => {
            throw new HttpException({
                message: [e.message]
            }, HttpStatus.BAD_REQUEST)
        })
    }

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

    async checkGames () {
        for (const game of this.games) {
            if (game.state === GameState.FINISHED) {
                let gameEntity = game.game
                let winner = gameEntity.winner
                winner.points += gameEntity.winner_points * 2.5
                await this.userService.updatePoints(winner.id, winner.points)
                this.removeGameFromGameArray(game.uuid)
            }
        }
    }

    async clientReadyToPlay(sub: number) {
        const game = this.getGameByUserId(sub)
        if (game) {
            await game.setPlayerReady(sub)
        }
    }

    updatePadCoordinates(sub: number, coordinates: Coordinates) {
        const game = this.getGameByUserId(sub)
        if (game) {
            game.updatePad(sub, coordinates)
        }
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

    clientLeft(client: Socket) {
        const clientIdx = this.websocketService.clients.map(c => c.id).indexOf(client.id)
        if (clientIdx !== -1) {
            const client = this.websocketService.clients[clientIdx]
            const sub = client.userId

            let game = this.getGameByUserId(sub)
            if (game) {
                game.clientLeft(sub)
                this.removeGameFromGameArray(game.uuid)
            }
        }
    }

    async clientJoinedSpectator(sub: number, uuid: string) {
        let game = this.getGameByUUID(uuid)
        if (game !== null) {
            try {
                const spectator = await this.userService.findOne(sub)
                game.addSpectator(spectator)
            } catch {}
        }
    }
}
