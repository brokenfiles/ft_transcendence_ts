<template>
  <div>
    <div class="flex flex-col items-center justify-center flex-wrap mt-12" v-if="user">
      <avatar class="h-24 w-24" :image-url="user.avatar">
        <user-online-icon class="absolute top-0 right-0" :is-online="connected"/>
      </avatar>
      <h1 class="font-semibold mt-2 text-2xl">
        <span v-if="guild">[{{guild.anagram}}]</span>
        {{ user.display_name }}
      </h1>
      <div v-if="guild && guild.owner">
        <p>{{ guild.owner.id === user.id ? 'Owner' : 'Officer' }} in {{ guild.name }}</p>
      </div>
      <level-bar class="mt-8" :points="user.points"/>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Avatar from "~/components/User/Profile/Avatar.vue";
import {mapGetters} from "vuex";
import LevelBar from "~/components/User/Profile/LevelBar.vue";
import UserOnlineIcon from "~/components/User/Profile/UserOnlineIcon.vue";
import {Component, Watch} from "nuxt-property-decorator";
import {Socket} from "vue-socket.io-extended";

interface UserState {
  userId: number
  online: boolean
}

@Component({
  components: {
    Avatar,
    LevelBar,
    UserOnlineIcon,
  },
})
export default class Account extends Vue {

  guild: any = null
  user: any = null
  connected: boolean = false

  async fetch() {
    this.user = await this.$axios.get(`/users?login=${this.$route.params.login}`).then(result => result.data)
    if (this.user.guild)
      this.guild = await this.$axios.get(`/guilds/${this.user.guild.id}`).then(result => result.data)
  }

  @Socket('onlineState')
  onlineStateEvent(state: boolean) {
    this.connected = state
  }

  @Socket('onlineStateUpdated')
  onlineStateUpdatedEvent(userState: UserState) {
    if (userState.userId === this.user.id) {
      this.connected = userState.online
    }
  }

  @Watch('user')
  userChanged() {
    if (process.client && this.user)
      this.$socket.client.emit('isOnline', this.user.id)
  }

}
</script>

<style scoped>

</style>
