import {Coordinates} from "~/utils/interfaces/game/coordinates.interface";

export interface BallInterface {
  coordinates: Coordinates
  h: number
  w: number
  color: number
  xSpeed: number
  ySpeed: number
}
