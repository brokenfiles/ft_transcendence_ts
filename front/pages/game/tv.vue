<template>
  <div class="mt-8 text-center">
    <p class="mb-4 text-4xl">The live games</p>
    <!--  afficher les current games  -->
    <div class="w-full flex flex-wrap">
      <div v-for="(match, index) in (validMatchs)" :key="`match-tv-${index}`"
           class="py-2 px-4 w-full md:w-1/2">
        <nuxt-link :to="`/game/${match.uuid}`" class="flex items-center justify-center bg-secondary p-2">
          <div class="flex-1">
            <avatar class="w-12 h-12 mx-auto mb-2" :image-url="match.players[0].avatar"/>
            <p>{{ match.players[0].display_name }}</p>
          </div>
          <p class="flex-1">
            <font-awesome-icon :icon="['fas', 'bolt']"/>
          </p>
          <div class="flex-1">
            <avatar class="w-12 h-12 mx-auto mb-2" :image-url="match.players[1].avatar"/>
            <p>{{ match.players[1].display_name }}</p>
          </div>
        </nuxt-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {Component, namespace} from 'nuxt-property-decorator'
import Avatar from "~/components/User/Profile/Avatar.vue";
import {GameInterface} from "~/utils/interfaces/game/game.interface";

const onlineClients = namespace('onlineClients')
const inGameClients = namespace('inGameClients')

@Component({
  middleware: ['auth'],
  components: {
    Avatar
  }
})
export default class GameTv extends Vue {

  /** Variables */
  matchs: GameInterface[] = []

  @onlineClients.Getter
  clients!: number[]

  @inGameClients.Getter
  inAGame!: number[]

  /** Methods */
  async fetch() {
    this.matchs = await this.$axios.$get(`games`)
  }

  /** Computed */
  get validMatchs(): GameInterface[] {
    return this.matchs.filter((match) => {
      return (match.players && match.players.length === 2);
    })
  }

}
</script>

<style scoped>

</style>
