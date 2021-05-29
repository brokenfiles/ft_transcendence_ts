import {UserInterface} from "~/utils/interfaces/users/user.interface";

export interface GuildInterface {

  id: number
  name: string
  anagram: string
  points: number
  war_points: number
  open: boolean
  users: UserInterface[]
  owner: UserInterface

}
