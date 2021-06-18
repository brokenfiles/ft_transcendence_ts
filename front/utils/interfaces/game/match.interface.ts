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
  leftPad: Pad
}
