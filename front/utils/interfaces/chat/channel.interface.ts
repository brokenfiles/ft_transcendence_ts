import {UserInterface} from "~/utils/interfaces/users/user.interface";
import {PrivacyEnum} from "~/utils/enums/privacy.enum";

export interface ChannelInterface {

  id: number
  name: string
  created_at: Date
  updated_at: Date
  users: UserInterface[]
  privacy: PrivacyEnum
  messages: any[]

}
