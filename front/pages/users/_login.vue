<template>
  <div>
    <div class="flex flex-col items-center w-full mt-12" v-if="user">
      <avatar class="h-24 w-24" :image-url="user.avatar">
        <user-online-icon class="absolute h-7 w-7 top-0 right-0" :is-online="isOnline"/>
      </avatar>
      <h1 class="font-semibold mt-2 text-2xl">
        <span v-if="guild">[{{guild.anagram}}]</span>
        <editable-field tag="div" classes="inline-block"
                        :editable="this.$auth.loggedIn && this.$auth.user.id === user.id"
                        :value="user.display_name" @stopEditing="saveDisplayName"/>
      </h1>
      <div v-if="guild && guild.owner">
        <p>{{ guild.owner.id === user.id ? 'Owner' : 'Officer' }} in {{ guild.name }}</p>
      </div>
      <div v-if="user.role !== 'user'">
        <p>ft_transcendence's {{ user.role }}</p>
      </div>
      <level-bar class="my-8" :points="user.points"/>
      <div class="flex flex-wrap justify-center my-2 mb-4 w-2/3">
        <!--statistics-->
        <statistic class="w-1/6 mx-2" unity="wins" value="4"/>
        <statistic class="w-1/6 mx-2" unity="loses" value="643"/>
        <statistic class="w-1/6 mx-2" unity="tournaments wins" value="54"/>
        <statistic class="w-1/6 mx-2" unity="wins" value="4"/>
        <statistic class="w-1/6 mx-2" unity="wins" value="4"/>
      </div>
      <div class="flex flex-wrap items-center justify-center space-x-2">
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
import Statistic from "~/components/User/Profile/Statistics/Statistic.vue";
import EditableField from "~/components/User/Profile/Editable/EditableField.vue";
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
    Achievement,
    Statistic,
    EditableField,
  },
})
export default class Account extends Vue {

  guild: any = null
  user: any = null
  connected: boolean = false

  @onlineClients.Getter
  clients!: number[]

  async fetch() {
    this.user = await this.$axios.get(`/users?login=${this.$route.params.login}`).then(result => result.data)
    if (this.user.guild)
      this.guild = await this.$axios.get(`/guilds/${this.user.guild.id}`).then(result => result.data)
  }

  /**
   * Event when the user saves the display name
   * Send a request to backend to change the display_name
   * @param {String} newDisplayName
   */
  saveDisplayName(newDisplayName: string) {
    this.$axios.patch('/users/me', {
      display_name: newDisplayName
    }).then((result) => {
      this.$toast.success(`Your new display name is ${result.data.display_name}`)
      this.user.display_name = result.data.display_name
      //refresh the user
      this.$auth.fetchUser()
    }).catch((error) => {
      this.$toast.error(`${error.response.data.message[0]}`)
    })
  }

  /**
   * Getter (isOnline)
   */
  get isOnline(): boolean {
    return (this.user && this.clients.indexOf(this.user.id) !== -1)
  }

}
</script>

<style scoped>

</style>
