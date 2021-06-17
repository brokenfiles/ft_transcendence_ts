export interface Coordinates {
    x: number
    y: number
}

export interface Pad {
    coordinates: Coordinates
    width: number
    height: number
}

export interface Ball {
    coordinates: Coordinates
    h: number
    w: number
    color: number
    xSpeed: number
    ySpeed: number
}

export interface GameInterface {
    gameWith: number
    gameHeight: number
    ball: Ball
    rightPad: Pad
    leftPad: Pad
}

export interface createGamePayload {
    rightPad: Pad
    leftPad: Pad
    ball: Ball
}