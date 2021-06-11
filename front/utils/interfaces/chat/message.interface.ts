import {UserInterface} from "~/utils/interfaces/users/user.interface";
import {ChannelInterface} from "~/utils/interfaces/chat/channel.interface";

export interface MessageInterface {

  id: number
  text: string
  created_at: Date
  updated_at: Date
  owner: UserInterface
  channel: ChannelInterface

}
