<template>
  <div>
    <div v-if="guild">
      <h2 class="text-center text-2xl font-bold mt-8">The guild has {{ guild.pending_users.length }} pending requests.</h2>
      <div class="flex flex-wrap mt-8">
        <guild-request
          v-for="(requester, index) in guild.pending_users" :key="`request-guild-${index}`"
          :requester="requester" :can-accept="userCanInteract" class="w-full md:w-1/2 p-2"
          @accepted="acceptRequest" @denied="denyRequest"/>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {Component} from 'nuxt-property-decorator'
import {GuildInterface} from "~/utils/interfaces/guilds/guild.interface";
import GuildRequest from "~/components/Guild/Requests/GuildRequest.vue";
import {UserInterface} from "~/utils/interfaces/users/user.interface";

@Component({
  middleware: ['auth', 'hasGuild'],
  components: {
    GuildRequest
  }
})
export default class GuildRequests extends Vue {

  guild?: GuildInterface

  async fetch() {
    await this.fetchGuild()
  }

  async fetchGuild() {
    if (this.$auth.user && this.$auth.user.guild)
      this.guild = await this.$axios.$get(`guilds/${this.$auth.user.guild.id}`)
  }

  acceptRequest(requester: UserInterface) {
    this.$axios.post('/guilds/mine/accept', {
      requester: {
        id: requester.id
      }
    }).then(async () => {
      this.$toast.success(`${requester.display_name} is now in your guild`)
      await this.fetchGuild()
      this.redirectIfNoPendingRequest()
    }).catch((err) => {
      this.$toast.error(err.response.data.message[0])
    })
  }

  denyRequest(requester: UserInterface) {
    this.$axios.post('/guilds/mine/deny', {
      requester: {
        id: requester.id
      }
    }).then(async () => {
      this.$toast.success(`${requester.display_name}'s request has been denied`)
      await this.fetchGuild()
      this.redirectIfNoPendingRequest()
    }).catch((err) => {
      this.$toast.error(err.response.data.message[0])
    })
  }

  redirectIfNoPendingRequest() {
    if (this.guild?.pending_users.length === 0)
      this.$router.push(`/guilds/${this.guild.anagram}`)
  }

  get userCanInteract() {
    return this.guild?.owner.id === this.$auth.user.id
  }

}
</script>

<style scoped>

</style>
