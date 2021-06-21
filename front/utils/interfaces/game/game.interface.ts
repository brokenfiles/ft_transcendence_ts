import {UserInterface} from "~/utils/interfaces/users/user.interface";

export interface GameInterface {
  id: number
  uuid: string
  state: string
  players: UserInterface[]
  winner: UserInterface
  looser: UserInterface
  winner_points: number
  looser_points: number
  created_at: Date
  updated_at: Date
}
