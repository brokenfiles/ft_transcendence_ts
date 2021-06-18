import {BallInterface, CreateGameInterface, PadInterface} from "../interfaces/game.interfaces";
import {User} from "../../users/entities/user.entity";

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
              x: 10,
              y: 480 / 2 - 74 / 2
          })
        else if (side === "right")
            this.setCoordinates({
                x: 620,
                y: 480 / 2 - 74 / 2
            })
        this.width = 10
        this.height = 74
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

    constructor() {
        this.coordinates = {
            x: 620 / 2 - 5,
            y: 480 / 2 - 5
        }
        this.w = 10
        this.h = 10
        this.color = 0xfff
        this.xSpeed = 3
        this.ySpeed = -3
    }

    updatePosition(game: GameClass) : boolean {
        this.coordinates.x += this.xSpeed
        this.coordinates.y += this.ySpeed
        if (this.coordinates.y <= 0 || this.coordinates.y + this.h / 2 >= game.gameHeight) {
            this.ySpeed *= -1
            return true
        }
        if (this.coordinates.x <= 0 || this.coordinates.x + this.w / 2 >= game.gameWith) {
            this.xSpeed *= -1
            return true
        }
        return false
    }
}

export class GameClass {
    uuid: string
    gameWith: number
    gameHeight: number
    ball: Ball
    rightPad: Pad
    leftPad: Pad
    players: User[]

    constructor(uuid: string, players: User[]) {
        this.uuid = uuid
        this.gameHeight = 480
        this.gameWith = 620
        this.ball = new Ball()
        this.rightPad = new Pad("right")
        this.leftPad = new Pad("left")
        this.players = players
    }
}
