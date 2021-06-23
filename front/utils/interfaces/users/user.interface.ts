import {AchievementInterface} from "./achievements/achievement.interface";
import {GuildInterface} from "~/utils/interfaces/guilds/guild.interface";
import {ChannelInterface} from "~/utils/interfaces/chat/channel.interface";

export interface UserInterface {

  id: number
  display_name: string
  first_name: string
  login: string
  role: string
  points: number
  elo: number
  avatar: string
  double_auth: boolean
  banned: string
  ban_reason: string
  guildId?: number
  guild?: GuildInterface
  guild_request?: GuildInterface
  channels_owned?: ChannelInterface[]
  friends?: UserInterface[]
  achievements?: AchievementInterface[]

}
