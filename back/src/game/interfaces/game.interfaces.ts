import {Coordinates} from "../classes/game.classes";

export interface PadInterface {
    coordinates: Coordinates
    width: number
    height: number
}

export interface BallInterface {
    coordinates: Coordinates
    h: number
    w: number
    color: number
    xSpeed: number
    ySpeed: number
}

export interface CreateGameInterface {
    width: number
    height: number
    rightPad: PadInterface
    leftPad: PadInterface
    ball: BallInterface
}