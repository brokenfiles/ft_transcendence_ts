import {AchievementInterface} from "~/utils/interfaces/users/achievements/achievement.interface";

export interface UserInterface {

  id: number
  display_name: string
  first_name: string
  login: string
  role: string
  points: number
  avatar: string
  double_auth: boolean
  banned: string
  ban_reason: string
  guildId?: number
  guild?: any
  friends?: UserInterface[]
  achievements?: AchievementInterface[]

}
