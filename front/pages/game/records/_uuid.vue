<template>
  <div>
    <div v-if="game">
      <single-game :game="game"></single-game>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {Component} from 'nuxt-property-decorator'
import {GameInterface} from "~/utils/interfaces/game/game.interface";
import SingleGame from "~/components/Game/Records/SingleGame.vue";

@Component({
  components: {
    SingleGame
  }
})
export default class ViewRecord extends Vue {

  /** Variables */
  game: GameInterface | null = null

  /** Methods */
  async fetch () {
    this.game = await this.$axios.$get(`games/${this.$route.params.uuid}`)
  }

}
</script>

<style scoped>

</style>
