import {UserInterface} from "../users/user.interface";

export interface GuildInterface {

  id: number
  description: string
  name: string
  anagram: string
  points: number
  war_points: number
  open: boolean
  users: UserInterface[]
  pending_users: UserInterface[]
  owner: UserInterface
  created_at: Date,
  updated_at: Date

}
