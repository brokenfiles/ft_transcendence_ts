<template>
  <div>
    <div v-if="requestedRequests.length > 0">
      <h2 class="text-center text-2xl font-bold mt-8">You have {{ requestedRequests.length }} friend request(s)</h2>
      <div class="flex flex-wrap my-8">
        <friend-request v-for="(friendRequest, index) in requestedRequests"
                        :friend-request="friendRequest" :key="`friend-request-${index}`"
                        class="w-full md:w-1/2 lg:w-1/3 xl:w-1/4 p-2"/>
      </div>
    </div>
    <h2 class="text-center text-2xl font-bold mt-8">Your beautiful friends :D</h2>
    <div class="flex flex-wrap my-8">
      <friend-component v-for="(friend, index) in this.$auth.user.friends"
                        :friend="friend" :is-online="online.includes(friend.id)"
                        :key="`friend-${index}`" class="w-full md:w-1/2 lg:w-1/3 xl:w-1/4 p-2"/>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {Component, namespace} from 'nuxt-property-decorator'
import FriendComponent from "~/components/User/Friends/Friend.vue";
import {FriendRequestInterface} from "~/utils/interfaces/users/requests/friend.request.interface";
import FriendRequest from "~/components/User/Friends/FriendRequest.vue";
const onlineClients = namespace('onlineClients')

@Component({
  middleware: ['auth'],

  components: {
    FriendComponent,
    FriendRequest,
  }
})
export default class Friends extends Vue {

  friendRequests: FriendRequestInterface[] = []

  @onlineClients.Getter
  clients!: number[]

  async fetch () {
    this.friendRequests = await this.$axios.$get('friends/requests')
  }

  get online(): number[] {
    return this.clients
  }

  get requestedRequests() {
    return this.friendRequests.filter(request => request.requested.id === (this.$auth.user as any).id)
  }

}
</script>

<style scoped>

</style>
