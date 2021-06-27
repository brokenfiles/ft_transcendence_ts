import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {Coordinates, GameClass} from "./classes/game.classes";
import {Socket} from "socket.io";
import {SchedulerRegistry} from "@nestjs/schedule";
import {ChallengeInterface, MatchInterface} from "./interfaces/game.interfaces";
import {InjectRepository} from "@nestjs/typeorm";
import {In, Repository} from "typeorm";
import {Game} from "./entity/game.entity";
import {UsersService} from "../users/users.service";
import {User} from "../users/entities/user.entity";
import {GameState} from "./enums/game-state.enum";
import {ClientJoinMatchInterface} from "../gateways/websocket/interfaces/client-join-match.interface";
import {WebsocketService} from "../gateways/websocket/websocket.service";
import {GuildsService} from "../guilds/guilds.service";
import {ChallengeUserInterface} from "../gateways/websocket/interfaces/challenge-user.interface";

@Injectable()
export class GameService {

    games: GameClass[] = []
    challenges: ChallengeInterface[] = []

    constructor(@InjectRepository(Game) private gameRepository: Repository<Game>,
                private schedulerRegistry: SchedulerRegistry,
                private userService: UsersService,
                private guildsService: GuildsService,
                private websocketService: WebsocketService) {
        const interval_id = setInterval(() => this.checkGames(), 1000)
        this.schedulerRegistry.addInterval('checkGames', interval_id)
    }

    async findPlayingGames() : Promise<Game[]> {
        return this.gameRepository.find({
            where: { state: GameState.IN_GAME },
            relations: ['players']
        })
    }

    findAllFromUser(id: number, page: number, take: number = 10) {
        return this.gameRepository.find( {
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
            take: take === -1 ? undefined : take,
            order: { created_at: "DESC" },
            relations: ['winner', 'looser'],
        })
    }

    async findAllFromGuild(id: number, page: number) {
        const guild = await this.guildsService.findOne(id)
        const users = guild.users.map(u => u.id)
        return this.gameRepository.find( {
            where: [
                {
                    state: GameState.FINISHED,
                    looser: In(users),
                },
                {
                    state: GameState.FINISHED,
                    winner: In(users),
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

    async findStatistics(id: number) {
        const games = await this.findAllFromUser(id, 0, -1)
        return {
            wins: games.filter((g) => g.winner.id === id).length,
            loses: games.filter((g) => g.looser.id === id).length,
            finished: games.length,
        }
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
        for (let game of this.games) {
            if (game.state === GameState.FINISHED) {
                let gameEntity = game.game
                let winner = gameEntity.winner
                const elo = this.calculateElo(gameEntity.winner.elo, gameEntity.looser.elo)
                await this.userService.updateElo(winner.id, winner.elo + elo)
                await this.userService.updateElo(gameEntity.looser.id, gameEntity.looser.elo - elo)
                gameEntity.save_looser_elo = gameEntity.looser.elo - elo
                gameEntity.save_winner_elo = gameEntity.winner.elo + elo
                gameEntity.elo = elo
                const difference = gameEntity.winner_points - gameEntity.looser_points
                winner.points += Math.floor(difference * 2)
                await this.userService.updatePoints(winner.id, winner.points)
                await this.userService.checkAchievements([winner.id, gameEntity.looser.id])
                await this.gameRepository.save(gameEntity)
                this.removeGameFromGameArray(game.uuid)
            }
        }
    }

    calculateElo (winner_elo: number, looser_elo: number) : number {
        return Math.floor(1.0 / (1.0 + Math.pow(10.0,(winner_elo - looser_elo) / 400)) * 30) + 1
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

    getGameBySocketAndUUID(client: Socket, payload: ClientJoinMatchInterface): MatchInterface | any {
        const game = this.getGameByUUID(payload.uuid)
        if (!game)
            return { error: `This game does not exist` }
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
            if (game)
                game.clientLeft(sub)
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

    async challengeUser(sub: any, payload: ChallengeUserInterface) {

        const requester = await this.userService.findOne(sub)
        const receiver = await this.userService.findOne(payload.user_id)

        if (requester && receiver && sub !== payload.user_id) {
            if (this.findChallenge(requester.id, receiver.id) === undefined) {
                this.challenges.push({ requester_id: requester.id, requested_id: receiver.id, created_at: new Date().getTime() })
                return {
                    requester_elo: requester.elo,
                    requester_name: requester.display_name,
                    requester_id: requester.id
                }
            } else {
                return {
                    error: "You already challenged this user (wait 60 seconds)"
                }
            }
        } else {
            return {
                error: "You can't duel yourself or a unknown player"
            }
        }
    }

    /**
     * Find the channel by requester and requested id
     * @param requester_id
     * @param requested_id
     * @returns the channel if found, undefined otherwise
     */
    findChallenge (requester_id: number, requested_id: number) : ChallengeInterface | undefined {
        for (const challenge of this.challenges) {
            if (challenge.requester_id === requester_id && challenge.requested_id === requested_id) {
                // if the created_at of the challenge is more than one minute, delete the challenge and return undefined
                if ((new Date().getTime() - challenge.created_at) / 1000 > 60) {
                    this.challenges.splice(this.challenges.indexOf(challenge), 1)
                    return undefined
                }
                return challenge
            }
        }
        return undefined
    }

    async startChallenge(sub: any, payload: ChallengeUserInterface) {
        const players = [sub, payload.user_id]
        const challenge = this.findChallenge(payload.user_id, sub)
        // if the challenge has been found
        if (challenge !== undefined) {
            if (this.websocketService.onlineClients.some(r => players.includes(r))) {
                this.challenges.splice(this.challenges.indexOf(challenge), 1)
                const players_entity = await Promise.all(players.map(userId => this.userService.findOne(userId)))
                const uuid = await this.initGame(players_entity)
                for (const clientId of players) {
                    const client = this.websocketService.getClient(clientId)
                    if (client) {
                        client.socket.emit('gameDuelStarting', {
                            players_entity, uuid
                        })
                    }
                }
            }
        } else {
            return {
                error: 'This challenge has expired'
            }
        }
    }
}
