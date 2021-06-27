import {UserInterface} from "~/utils/interfaces/users/user.interface";

export interface Keys {
  pressed: string[]
}

export interface Coordinates {
  x: number
  y: number
}

export interface Ball {
  coordinates: Coordinates
  h: number
  w: number
  color: number
  xSpeed: number
  ySpeed: number
}

export interface Pad {
  coordinates: Coordinates
  width: number
  height: number
}

export interface MatchInterface {
  uuid: string
  gameWith: number
  gameHeight: number
  players: UserInterface[]
  ball: Ball
  rightPad: Pad
  leftPad: Pad,
  state: string
}

export interface PlayerMarkedInterface {
  winner: UserInterface,
  points: number
}

export interface ResetCanvasInterface {
  leftPad: Pad,
  rightPad: Pad,
  ball: Ball
}

export interface GameFinishedInterface {
  winner: UserInterface
  points: any
}
