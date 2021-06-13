import {UserInterface} from "~/utils/interfaces/users/user.interface";
import {PrivacyEnum} from "~/utils/enums/privacy.enum";

export interface ChannelInterface {

  id: number
  uuid: string
  name: string
  created_at: Date
  updated_at: Date
  users: UserInterface[]
  privacy: PrivacyEnum
  messages: any[]
  password?: string

}
