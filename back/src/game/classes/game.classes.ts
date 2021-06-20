import {User} from "../../users/entities/user.entity";
import {WebsocketService} from "../../gateways/websocket/websocket.service";
import {GameState} from "../enums/game-state.enum";
import {Repository} from "typeorm";
import {Game} from "../entity/game.entity";
import {SchedulerRegistry} from "@nestjs/schedule";

export const GAME_CONSTANTS = {
    tps: 20,
    max_points: 500,
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
          this.setCoordinates({
              x: GAME_CONSTANTS.pad.margin,
              y: GAME_CONSTANTS.window.height / 2 - GAME_CONSTANTS.pad.height / 2
          })
        else if (side === "right")
            this.setCoordinates({
                x: GAME_CONSTANTS.window.width - GAME_CONSTANTS.pad.width - GAME_CONSTANTS.pad.margin,
                y: GAME_CONSTANTS.window.height / 2 - GAME_CONSTANTS.pad.height / 2
            })
        this.width = GAME_CONSTANTS.pad.width
        this.height = GAME_CONSTANTS.pad.height
    }

    public setCoordinates(coordinates: Coordinates)
    {
        this.coordinates = {
            x: coordinates.x,
            y: coordinates.y
        }
    }
}

export class Ball {

    coordinates: Coordinates
    h: number
    w: number
    color: number
    xSpeed: number
    ySpeed: number

    private static randomIntFromInterval(min, max) { // min and max included
        return Math.random() * (max - min + 1) + min
    }

    constructor() {
        const xWay = Math.floor(Ball.randomIntFromInterval(0, 1)) === 1 ? 1 : -1
        const yWay = Math.floor(Ball.randomIntFromInterval(0, 1)) === 1 ? 1 : -1

        this.coordinates = {
            x: GAME_CONSTANTS.window.width / 2 - (GAME_CONSTANTS.ball.width / 2),
            y: GAME_CONSTANTS.window.height / 2 - (GAME_CONSTANTS.ball.height / 2)
        }
        this.w = GAME_CONSTANTS.ball.width
        this.h = GAME_CONSTANTS.ball.height
        this.color = 0xfff
        this.xSpeed = Ball.randomIntFromInterval(3, 4) * xWay
        this.ySpeed = Ball.randomIntFromInterval(1, 3) * yWay
        console.log(this)
    }

    public updatePosition(game: GameClass) {
        const nextCoordinates = {
            x: this.coordinates.x += this.xSpeed,
            y: this.coordinates.y += this.ySpeed
        }

        this.yCollisions(nextCoordinates)
        this.xCollisions(nextCoordinates, game)
        if (this.padsCollisions(nextCoordinates, game))
            // this.increaseBallSpeed()

        this.coordinates.x += this.xSpeed
        this.coordinates.y += this.ySpeed

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
            if (game.ball.coordinates.x <= 0)
                winner = game.players[1]
            else
                winner = game.players[0]
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
        if (coordinates.x >= game.rightPad.coordinates.x - GAME_CONSTANTS.ball.width && coordinates.x <= game.rightPad.coordinates.x &&
            coordinates.y >= game.rightPad.coordinates.y && coordinates.y <= game.rightPad.coordinates.y + GAME_CONSTANTS.pad.height) {
            this.xSpeed *= -1
        }
        if (coordinates.x - GAME_CONSTANTS.ball.width <= game.leftPad.coordinates.x && coordinates.x >= game.leftPad.coordinates.x &&
            coordinates.y >= game.leftPad.coordinates.y && coordinates.y <= game.leftPad.coordinates.y + GAME_CONSTANTS.pad.height) {
            this.xSpeed *= -1
        }
        return previousXSpeed !== this.xSpeed
    }

    private increaseBallSpeed() {
        if (this.xSpeed < 0) {
            this.xSpeed -= 0.3
        } else {
            this.xSpeed += 0.3
        }
        if (this.ySpeed < 0) {
            this.ySpeed -= 0.3
        } else {
            this.ySpeed += 0.3
        }
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
    ball: Ball
    rightPad: Pad
    leftPad: Pad
    players: User[]
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
        this.ball = new Ball()
        this.gameHeight = GAME_CONSTANTS.window.height
        this.gameWith = GAME_CONSTANTS.window.width
        this.players = players
        this.playersReady = []
        this.points = {}
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
        this.setState(GameState.IN_GAME)
        const intervalId = setInterval(() => this.gameLoop(this), GAME_CONSTANTS.tps)
        this.schedulerRegistry.addInterval(this.uuid, intervalId)
    }

    public stopGame (winner: User) {
        this.schedulerRegistry.deleteInterval(this.uuid)
        this.setState(GameState.FINISHED)
        this.sendEventToPlayers(`gameFinished`, { winner, points: this.points })
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
     */
    public markPoint(winner: User) {
        this.setState(GameState.PAUSED)
        this.sendEventToPlayers('pointMarked', { winner, points: this.points[winner.id] })
        this.reset()
        this.points[winner.id] ++
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
        this.ball = new Ball()
        this.rightPad = new Pad("right")
        this.leftPad = new Pad("left")
        this.sendEventToPlayers('resetCanvas', {
            leftPad: this.leftPad,
            rightPad: this.rightPad,
            ball: this.ball
        })
    }

    public setPlayerReady (sub: number) {
        const user = this.findUserById(sub)
        if (user !== undefined && !this.playersReady.includes(user)) {
            this.playersReady.push(user)

            if (this.playersReady.length === 2)
                this.startGame()
        }
    }

    public findUserById (sub: number) : User | undefined {
        for (const user of this.players) {
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
        for (const player of this.players) {
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
