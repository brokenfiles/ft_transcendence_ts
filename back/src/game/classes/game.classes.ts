import {User} from "../../users/entities/user.entity";
import {WebsocketService} from "../../gateways/websocket/websocket.service";
import {GameState} from "../enums/game-state.enum";
import {Repository} from "typeorm";
import {Game} from "../entity/game.entity";
import {SchedulerRegistry} from "@nestjs/schedule";
import {UsersService} from "../../users/users.service";

export const GAME_CONSTANTS = {
    tps: 20,
    max_points: 5,
    starting_time: 3000,
    window: {
        height: 480,
        width: 640
    },
    pad: {
        width: 10,
        height: 74,
        margin: 10
    },
    ball: {
        width: 10,
        height: 10
    }
}

export interface Coordinates {
    x: number
    y: number
}

export class Pad {
    coordinates: Coordinates
    width: number
    height: number

    constructor(side: string) {
        if (side === "left")
          this.coordinates = {
              x: GAME_CONSTANTS.pad.margin,
              y: GAME_CONSTANTS.window.height / 2 - GAME_CONSTANTS.pad.height / 2
          }
        else if (side === "right")
            this.coordinates = {
                x: GAME_CONSTANTS.window.width - GAME_CONSTANTS.pad.width - GAME_CONSTANTS.pad.margin,
                y: GAME_CONSTANTS.window.height / 2 - GAME_CONSTANTS.pad.height / 2
            }
        this.width = GAME_CONSTANTS.pad.width
        this.height = GAME_CONSTANTS.pad.height
    }

    public setCoordinates(coordinates: Coordinates)
    {
        this.coordinates.y = coordinates.y
    }
}

export class Ball {

    coordinates: Coordinates
    h: number
    w: number
    color: number
    xSpeed: number
    ySpeed: number

    constructor(game: GameClass) {
        this.coordinates = {
            x: GAME_CONSTANTS.window.width / 2 - (GAME_CONSTANTS.ball.width / 2),
            y: GAME_CONSTANTS.window.height / 2 - (GAME_CONSTANTS.ball.height / 2)
        }
        this.w = GAME_CONSTANTS.ball.width
        this.h = GAME_CONSTANTS.ball.height
        this.color = 0xfff

        this.xSpeed = 5.80
        this.ySpeed = 0.20

        if (game.players && game.players.length === 2) {
            if (game.lastMarkedPoint === game.players[0].id)
                this.xSpeed *= -1
        }
    }


    public updatePosition(game: GameClass) {
        const nextCoordinates = {
            x: this.coordinates.x += this.xSpeed,
            y: this.coordinates.y += this.ySpeed
        }

        this.yCollisions(nextCoordinates)
        this.xCollisions(nextCoordinates, game)
        this.padsCollisions(nextCoordinates, game)

        // this.coordinates.x += this.xSpeed
        this.coordinates.y += this.ySpeed

        if (game.state === GameState.IN_GAME)
            this.emitPosition(game)
    }

    private yCollisions (coordinates: Coordinates) {
        if (coordinates.y <= 0 || coordinates.y + GAME_CONSTANTS.ball.height >= GAME_CONSTANTS.window.height) {
            this.ySpeed *= -1
        }
    }

    private xCollisions (coordinates: Coordinates, game: GameClass) {
        if (coordinates.x <= 0 || coordinates.x + GAME_CONSTANTS.ball.width >= GAME_CONSTANTS.window.width) {
            let winner
            if (coordinates.x <= 0)
                winner = game.players[0]
            else
                winner = game.players[1]
            this.xSpeed *= -1
            game.markPoint(winner)
        }
    }

    /**
     * handle the pads collisions
     * @param coordinates
     * @param game
     * @return boolean if ball collides a pad
     * @private
     */
    private padsCollisions (coordinates: Coordinates, game: GameClass): boolean {
        const previousXSpeed = this.xSpeed

        let yHit
        let heightHit = -9

        if (coordinates.x >= game.rightPad.coordinates.x - GAME_CONSTANTS.ball.width && coordinates.x <= game.rightPad.coordinates.x &&
            coordinates.y + GAME_CONSTANTS.ball.height >= game.rightPad.coordinates.y && coordinates.y <= game.rightPad.coordinates.y + GAME_CONSTANTS.pad.height) {
            this.xSpeed *= -1

            yHit = coordinates.y - game.rightPad.coordinates.y
            heightHit = yHit / GAME_CONSTANTS.pad.height - 0.5


        }
        if (coordinates.x - GAME_CONSTANTS.ball.width <= game.leftPad.coordinates.x && coordinates.x >= game.leftPad.coordinates.x &&
            coordinates.y + GAME_CONSTANTS.ball.height >= game.leftPad.coordinates.y && coordinates.y <= game.leftPad.coordinates.y + GAME_CONSTANTS.pad.height) {
            this.xSpeed *= -1
            yHit = coordinates.y - game.leftPad.coordinates.y
            heightHit = yHit / GAME_CONSTANTS.pad.height - 0.5

        }

        if (heightHit !== -9) {
            if (heightHit <= 0.15 && heightHit >= -0.15)
                return true
            this.ySpeed += heightHit * 6
        }

        return previousXSpeed !== this.xSpeed
    }

    public emitPosition (game: GameClass) {
        game.sendEventToPlayers('ballUpdated', this)
    }
}

export class GameClass {

    /** Variables */
    state: GameState
    uuid: string
    gameWith: number
    gameHeight: number
    lastMarkedPoint: number
    ball: Ball
    rightPad: Pad
    leftPad: Pad
    players: User[]
    spectators: User[]
    playersReady: User[]
    points: any
    websocketService: WebsocketService
    repository: Repository<Game>
    schedulerRegistry: SchedulerRegistry
    game: Game

    constructor(players: User[], websocketService: WebsocketService,
                repository: Repository<Game>, schedulerRegistry: SchedulerRegistry) {
        this.websocketService = websocketService
        this.repository = repository
        this.schedulerRegistry = schedulerRegistry
        this.state = GameState.WARMING
        this.rightPad = new Pad("right")
        this.leftPad = new Pad("left")
        this.ball = new Ball(this)
        this.gameHeight = GAME_CONSTANTS.window.height
        this.gameWith = GAME_CONSTANTS.window.width
        this.players = players
        this.spectators = []
        this.playersReady = []
        this.points = {}
        this.lastMarkedPoint = 0
    }

    /**
     * Initiate the game
     * @private
     */
    public async init () {
        let game = this.repository.create()
        game.players = this.players
        this.setState(GameState.WARMING)
        // set the players points in "points" object to 0
        this.points[game.players[0].id] = 0
        this.points[game.players[1].id] = 0
        // save the game in the database to get the uuid
        this.game = await this.repository.save(game)
        this.uuid = this.game.uuid
    }

    /**
     * Starts the game
     */
    public startGame () {
        this.sendEventToPlayers(`gameStarted`)
        setTimeout(() => this.setState(GameState.IN_GAME), GAME_CONSTANTS.starting_time + 1000)
        const intervalId = setInterval(() => this.gameLoop(this), GAME_CONSTANTS.tps)
        this.schedulerRegistry.addInterval(this.uuid, intervalId)
    }

    public stopGame (winner: User) {
        const looser = this.players.filter(u => u.id !== winner.id)[0]
        if (this.schedulerRegistry.getIntervals().includes(this.uuid))
            this.schedulerRegistry.deleteInterval(this.uuid)
        this.setState(GameState.FINISHED)
        this.game.winner = winner
        this.game.looser = looser
        this.game.winner_points = this.points[winner.id]
        this.game.looser_points = this.points[looser.id]
        this.game.state = this.state
        this.repository.save(this.game)
            .then(() => {
                this.sendEventToPlayers(`gameFinished`, { winner, points: this.points })
            })
    }

    /**
     * The main game loop
     */
    public gameLoop (game: GameClass) {
        if (game.state !== GameState.IN_GAME)
            return ;
        game.ball.updatePosition(game)
    }

    public updatePad (sub: number, coordinates: Coordinates) {
        if (this.state !== GameState.IN_GAME)
            return ;
        let pad = this.getPadByUser(sub)
        pad.setCoordinates(coordinates)
        this.sendEventToPlayers('otherPlayerPadUpdated', coordinates, sub)
    }

    /**
     * Mark a point
     * @param winner
     * @param points
     */
    public markPoint(winner: User, points: number = 1) {
        this.setState(GameState.PAUSED)
        this.lastMarkedPoint = winner.id
        this.reset()
        this.points[winner.id] += points
        this.sendEventToPlayers('pointMarked', { winner, points: this.points[winner.id] })
        if (this.points[winner.id] >= GAME_CONSTANTS.max_points) {
            // stop the game
            this.stopGame(winner)
        } else {
            // unpause the game
            setTimeout(() => {
                this.setState(GameState.IN_GAME)
            }, 3000)
        }
    }

    /**
     * Set the game to default state
     */
    public reset () {
        this.ball = new Ball(this)
        this.rightPad = new Pad("right")
        this.leftPad = new Pad("left")
        this.sendEventToPlayers('resetCanvas', {
            leftPad: this.leftPad,
            rightPad: this.rightPad,
            ball: this.ball
        })
    }

    public clientLeft (sub: number) {
        const user = this.findUserById(sub)
        // check if the player is one of the two players
        if (user !== undefined && this.players.length === 2) {
            const winner = this.players.filter((p) => p.id !== user.id)[0]
            this.markPoint(winner, GAME_CONSTANTS.max_points - this.points[winner.id])
        }
        const spectator = this.findSpectatorById(sub)
        if (spectator !== undefined) {
            this.spectators.splice(this.spectators.indexOf(spectator), 1)
        }
    }

    public async setPlayerReady (sub: number) : Promise<void> {
        const user = this.findUserById(sub)
        if (user !== undefined && !this.playersReady.includes(user)) {
            this.playersReady.push(user)

            if (this.playersReady.length === 2)
                this.startGame()
        }
    }

    public addSpectator (user: User) {
        if (!this.spectators.includes(user))
            this.spectators.push(user)
    }

    public findUserById (sub: number) : User | undefined {
        for (const user of this.players) {
            if (user.id === sub)
                return user
        }
        return undefined
    }

    public findSpectatorById (sub: number) : User | undefined {
        for (const user of this.spectators) {
            if (user.id === sub)
                return user
        }
        return undefined
    }

    public getPadByUser (sub: number) : Pad {
        const game = this as any
        return (game[game.players[0].id === sub ? "rightPad" : "leftPad"])
    }

    /**
     * This function sends a event and payload to all clients
     */
    public sendEventToPlayers (event: string, payload: any = null, skipSub: number = -1) {
        const users = [...this.players, ...this.spectators]
        for (const player of users) {
            const client = this.websocketService.getClient(player.id)
            if (client !== undefined && (skipSub === -1 || player.id !== skipSub)) {
                client.socket.emit(event, payload)
            }
        }
    }

    /**
     * Remove useless variables to send on front
     */
    public serialize () : GameClass {
        let copy = {...this}
        delete copy.repository
        delete copy.websocketService
        delete copy.playersReady
        delete copy.schedulerRegistry
        return copy
    }

    public setState (state: GameState) {
        this.sendEventToPlayers(`stateUpdated`, state)
        this.state = state
    }

}
