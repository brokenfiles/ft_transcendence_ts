import {Coordinates} from "../classes/game.classes";

export interface PadInterface {
    coordinates: Coordinates
    w: number
    h: number
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
    p1: number
    p2: number
    width: number
    height: number
    rightPad: PadInterface
    leftPad: PadInterface
    ball: BallInterface
}