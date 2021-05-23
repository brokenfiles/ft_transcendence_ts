<template>
  <div>
    <div class="flex flex-col items-center w-full mt-12" v-if="user">
      <avatar class="h-24 w-24" :image-url="user.avatar">
        <user-online-icon class="absolute h-7 w-7 top-0 right-0" :is-online="isOnline"/>
      </avatar>
      <h1 class="font-semibold mt-2 text-2xl">
        <span v-if="guild">[{{guild.anagram}}]</span>
        {{ user.display_name }}
      </h1>
      <div v-if="guild && guild.owner">
        <p>{{ guild.owner.id === user.id ? 'Owner' : 'Officer' }} in {{ guild.name }}</p>
      </div>
      <level-bar class="my-8" :points="user.points"/>
      <div class="flex flex-wrap space-x-2">
        <!--achievements-->
        <achievement v-for="(achievement, index) in user.achievements" :key="`achievement-${index}`"
        :name="achievement.name" :description="achievement.description" :color="achievement.color"/>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Avatar from "~/components/User/Profile/Avatar.vue";
import LevelBar from "~/components/User/Profile/LevelBar.vue";
import UserOnlineIcon from "~/components/User/Profile/UserOnlineIcon.vue";
import {Component, namespace} from "nuxt-property-decorator";
import Achievement from "~/components/User/Profile/Statistics/Achievement.vue";
const onlineClients = namespace('onlineClients')

interface UserState {
  userId: number
  online: boolean
}

@Component({
  components: {
    Avatar,
    LevelBar,
    UserOnlineIcon,
    Achievement
  },
})
export default class Account extends Vue {

  guild: any = null
  user: any = null
  connected: boolean = false

  @onlineClients.Getter
  clients: number[]

  async fetch() {
    this.user = await this.$axios.get(`/users?login=${this.$route.params.login}`).then(result => result.data)
    if (this.user.guild)
      this.guild = await this.$axios.get(`/guilds/${this.user.guild.id}`).then(result => result.data)
  }

  get isOnline(): boolean {
    return (this.user && this.clients.indexOf(this.user.id) !== -1)
  }

}
</script>

<style scoped>

</style>
