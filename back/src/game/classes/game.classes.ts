import {BallInterface, CreateGameInterface, PadInterface} from "../interfaces/game.interfaces";

export interface Coordinates {
    x: number
    y: number
}


export class Pad {
    coordinates: Coordinates
    width: number
    height: number

    constructor(currPad: PadInterface) {
        this.coordinates = {
            x: currPad.coordinates.x,
            y: currPad.coordinates.y
        }
        this.width = currPad.w
        this.height = currPad.h
    }

    public setCoordinates(pad: PadInterface)
    {
        this.coordinates = {
            x: pad.coordinates.x,
            y: pad.coordinates.y
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

    constructor(ball: BallInterface) {
        this.coordinates = {
            x: ball.coordinates.x,
            y: ball.coordinates.y
        }
        this.w = ball.w
        this.h = ball.h
        this.color = ball.color
        this.xSpeed = ball.xSpeed
        this.ySpeed = ball.ySpeed
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
    gameWith: number
    gameHeight: number
    ball: Ball
    rightPad: Pad
    leftPad: Pad

    constructor(createGame: CreateGameInterface) {
        this.gameHeight = createGame.height
        this.gameWith = createGame.width
        this.ball = new Ball(createGame.ball)
        this.rightPad = new Pad(createGame.rightPad)
        this.leftPad = new Pad(createGame.leftPad)
    }
}
