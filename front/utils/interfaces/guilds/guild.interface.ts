import {UserInterface} from "../users/user.interface";

export interface GuildInterface {

  id: number
  name: string
  anagram: string
  points: number
  war_points: number
  open: boolean
  users: UserInterface[]
  max_users: number
  pending_users: UserInterface[]
  owner: UserInterface
  created_at: Date,
  updated_at: Date

}
