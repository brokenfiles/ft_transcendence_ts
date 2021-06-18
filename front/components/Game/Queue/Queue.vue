<template>
  <div class="w-full h-96 relative">
    <div class="h-full flex flex-wrap items-center justify-center text-center">
      <div class="w-1/2 h-full border-r border-cream">
        <queue-slot class="relative" color="rgb(30, 61, 59)" :player="getPlayer(0)"/>
      </div>
      <div class="w-1/2 h-full">
        <queue-slot class="relative" color="rgb(60, 41, 59)" :player="getPlayer(1)"/>
      </div>
    </div>
    <div class="versus">
      VS
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {Component, Prop} from 'nuxt-property-decorator'
import {UserInterface} from "~/utils/interfaces/users/user.interface";
import QueueSlot from "~/components/Game/Queue/QueueSlot.vue";
import {Socket} from "vue-socket.io-extended";

interface GameStartingInterface {
  players: UserInterface[],
  uuid: string
}

@Component({
  components: {
    QueueSlot
  }
})
export default class Queue extends Vue {

  /** Variables */
  queued_players: UserInterface[] = []

  /** Properties */
  @Prop({required: true}) user!: UserInterface

  mounted () {
    // add the player who rendering the component in the queued players
    this.queued_players.push(this.user)
    // when a client mount this component, we emit an event to avert the back
    this.$socket.client.emit('clientJoinedQueue')
  }

  beforeDestroy () {
    const idx = this.queued_players.map(u => u.id).indexOf(this.user.id)
    if (idx !== -1) {
      this.queued_players.splice(idx, 1)
      this.$socket.client.emit('clientLeftQueue', this.user.id)
    }
  }

  /**
   * Get the player by his id or null
   * @param n
   */
  getPlayer (n: number): UserInterface | null {
    const player = this.queued_players[n]
    if (player)
      return player
    return null
  }

  /** Sockets */

  /**
   * When a client join the queue
   * @param user
   */
  @Socket("clientJoinedQueue")
  clientJoinedQueue (user: UserInterface) {
    if (this.queued_players.length === 1) {
      this.queued_players.push(user)
    }
  }

  @Socket("gameStarting")
  gameStartingEvent (gameStartingOptions: GameStartingInterface) {
    if (gameStartingOptions.players.length === 2 && this.queued_players.length === 2) {
      this.$toast.info(`Match against ${gameStartingOptions.players[0].display_name} and ${gameStartingOptions.players[1].display_name} starting...`)
      setTimeout(() => {
        this.$router.push(`/game/${gameStartingOptions.uuid}`)
      }, 3000)
    }
  }

  @Socket("clientLeftQueue")
  clientLeftQueueEvent (clientId: number) {
    const idx = this.queued_players.map(u => u.id).indexOf(clientId)
    if (idx !== -1) {
      this.$toast.info(`${this.queued_players[idx].display_name} left the queue`)
      this.queued_players.splice(idx, 1)
    }
  }

}
</script>

<style scoped>

.versus {
  @apply absolute top-1/2 left-1/2 w-16 h-16 text-center bg-cream flex items-center justify-center text-blue-800 font-extrabold rounded-xl;
  transform: translateY(-50%) translateX(-50%);
  font-size: 35px;
}

</style>
