import {Ball, Coordinates, Pad} from "../classes/game.classes";
import {User} from "../../users/entities/user.entity";

export interface PadInterface {
    coordinates: Coordinates
    w: number
    h: number
}

export interface MatchInterface {
    uuid: string
    gameWith: number
    gameHeight: number
    players: User[]
    ball: Ball
    rightPad: Pad
    leftPad: Pad
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
