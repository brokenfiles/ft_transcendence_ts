import {UserInterface} from "~/utils/interfaces/users/user.interface";

export interface ChannelInterface {

  id: number
  name: string
  created_at: Date
  updated_at: Date
  users: UserInterface[]
  messages: any[]

}
