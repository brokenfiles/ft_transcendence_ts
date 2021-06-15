import {UserInterface} from "~/utils/interfaces/users/user.interface";
import {PrivacyEnum} from "~/utils/enums/privacy.enum";
import {MessageInterface} from "~/utils/interfaces/chat/message.interface";

export interface ChannelInterface {

  id: number
  uuid: string
  name: string
  created_at: Date
  updated_at: Date
  users: UserInterface[]
  owner: UserInterface
  privacy: PrivacyEnum
  messages: MessageInterface[]
  banned_users: UserInterface[]
  administrators: UserInterface[]
  password?: string

}
